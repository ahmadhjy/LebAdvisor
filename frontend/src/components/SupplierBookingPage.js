import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import api from '../services/api';
import ActivityCard from './supplier/ActivityCard';
import TourCard from './supplier/TourCard';
import PackageCard from './supplier/PackageCard';
import './Booking.css';
import {
  FaTasks,
  FaBoxes,
  FaRoute,
  FaCheck,
  FaTimes,
  FaUserFriends,
  FaMoneyBillWave,
} from 'react-icons/fa';

ChartJS.register(...registerables);

const SupplierBookingPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityBookings, setActivityBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [filter, setFilter] = useState('all');
  const [bookingData, setBookingData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [offers, setOffers] = useState([]);

  const fetchBookings = async () => {
    try {
      const [
        activitiesResponse,
        packagesResponse,
        toursResponse,
        dashboardResponse,
      ] = await Promise.all([
        api.get('/api/supplier/bookings/'),
        api.get('/api/supplier/packagesb/'),
        api.get('/api/supplier/toursb/'),
        api.get('/api/supplier-dashboard/'),
      ]);

      setActivityBookings(activitiesResponse.data || []);
      setPackageBookings(packagesResponse.data || []);
      setTourBookings(toursResponse.data || []);
      setDashboardData(dashboardResponse.data || {});

      const [
        bookingsPerMonth,
        customersPerMonth,
        salesPerMonth,
      ] = await Promise.all([
        api.get('/api/supplier/bookings-per-month/'),
        api.get('/api/supplier/customers-per-month/'),
        api.get('/api/supplier/sales-per-month/'),
      ]);

      setBookingData(bookingsPerMonth.data || []);
      setCustomerData(customersPerMonth.data || []);
      setSalesData(salesPerMonth.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await api.get('/api/supplier-offers/');
      setOffers(response.data);
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchBookings();
  }, []);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleConfirm = async (type, bookingId) => {
    try {
      let endpoint = '';
      if (type === 'activity') {
        endpoint = `/api/supplier/bookings/${bookingId}/confirm/`;
      } else if (type === 'package') {
        endpoint = `/api/supplier/package/${bookingId}/confirm/`;
      } else if (type === 'tour') {
        endpoint = `/api/supplier/tour/${bookingId}/confirm/`;
      }
      await api.post(endpoint);
      await fetchBookings();
    } catch (err) {
      setError(err);
    }
  };

  const filterBookings = (bookings = []) => {
    if (filter === 'all') return bookings;
    return bookings.filter((booking) => {
      if (filter === 'paid') return booking.paid;
      if (filter === 'unpaid') return !booking.paid;
      if (filter === 'confirmed') return booking.confirmed;
      if (filter === 'unconfirmed') return !booking.confirmed;
      return true;
    });
  };

  const renderBookingList = (bookings = [], type) => (
    <Grid container spacing={2} className="fancy-booking-grid">
      {bookings.length > 0 ? (
        filterBookings(bookings).map((booking) => {
          const imageUrl =
            booking.period?.activity_offer?.activity?.image ||
            booking.tourday?.tour_offer?.tour?.image ||
            booking.package_offer?.package?.image;
          const title =
            booking.period?.activity_offer?.activity?.title ||
            booking.tourday?.tour_offer?.tour?.title ||
            booking.package_offer?.package?.title ||
            'Booking';
          const offer =
            booking.period?.activity_offer?.title ||
            booking.tourday?.tour_offer?.title ||
            booking.package_offer?.title ||
            'Offer';
          const price =
            (booking.period?.activity_offer?.price ||
              booking.tourday?.tour_offer?.price ||
              booking.package_offer?.price ||
              0) * booking.quantity;
          const day = booking.period?.day || booking.tourday?.day || booking.start_date;
          const startTime =
            booking.period?.time_from ||
            booking.tourday?.tour_offer?.tour?.pickup_time ||
            booking.start_date;
          const endTime =
            booking.period?.time_to ||
            booking.tourday?.tour_offer?.tour?.dropoff_time ||
            booking.end_date;
          const customerUsername = booking.customer?.user?.username;
          const customerEmail = booking.customer?.user?.email;
          const customerPhone = booking.customer?.user?.phone;

          return (
            <Grid item xs={12} sm={6} md={4} key={booking.id}>
              <Card className="fancy-booking-card">
                {imageUrl && (
                  <img
                    src={`http://localhost:8000/${imageUrl}`}
                    className="fancy-booking-image"
                    alt="Booking"
                  />
                )}
                <CardContent className="fancy-booking-content">
                  <Typography
                    variant="h6"
                    component="h2"
                    className="fancy-booking-title"
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="fancy-booking-detail fancy-label"
                  >
                    Offer:
                    <span className="fancy-booking-value">
                      {offer}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className="fancy-booking-detail fancy-label"
                  >
                    Price:
                    <span className="fancy-booking-value">
                      ${price}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className="fancy-booking-detail fancy-label"
                  >
                    Day:
                    <span className="fancy-booking-value">
                      {day}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className="fancy-booking-detail fancy-label"
                  >
                    Starts at:
                    <span className="fancy-booking-value">
                      {startTime}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className="fancy-booking-detail fancy-label"
                  >
                    Ends at:
                    <span className="fancy-booking-value">
                      {endTime}
                    </span>
                  </Typography>
                  {customerUsername && (
                    <Typography
                      variant="body2"
                      className="fancy-booking-detail fancy-label"
                    >
                      Customer:
                      <span className="fancy-booking-value">
                        {customerUsername}
                      </span>
                    </Typography>
                  )}
                  {customerEmail && (
                    <Typography
                      variant="body2"
                      className="fancy-booking-detail fancy-label"
                    >
                      Email:
                      <span className="fancy-booking-value">
                        {customerEmail}
                      </span>
                    </Typography>
                  )}
                  {customerPhone && (
                    <Typography
                      variant="body2"
                      className="fancy-booking-detail fancy-label"
                    >
                      Phone:
                      <span className="fancy-booking-value">
                        {customerPhone}
                      </span>
                    </Typography>
                  )}
                  {!booking.confirmed ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleConfirm(type, booking.id)}
                      className="fancy-confirm-button"
                    >
                      Confirm
                    </Button>
                  ) : (
                    <Typography
                      variant="body1"
                      className="fancy-booking-status confirmed"
                    >
                      <FaCheck className="icon-inline" /> Confirmed
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })
      ) : (
        <Typography className="fancy-no-bookings">
          No bookings available
        </Typography>
      )}
    </Grid>
  );

  if (loading)
    return (
      <Container className="fancy-container">
        <CircularProgress className="fancy-loading" />
      </Container>
    );
  if (error)
    return (
      <Container className="fancy-container">
        <Alert severity="error" className="fancy-error">
          Error loading data: {error.message}
        </Alert>
      </Container>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container className="fancy-container">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          className="fancy-dashboard-title"
        >
          Supplier Dashboard
        </Typography>

        {dashboardData && (
          <Grid container spacing={4} className="fancy-summary-grid">
            <Grid item xs={12} md={6}>
              <Card className="fancy-summary-card centered-card">
                <CardContent>
                  <Typography className="fancy-card-title">
                    Unconfirmed Bookings: {dashboardData.unconfirmed_bookings || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="fancy-summary-card centered-card">
                <CardContent>
                  <Typography className="fancy-card-title">
                    Today's Customers
                  </Typography>
                  {dashboardData.todays_customers &&
                  dashboardData.todays_customers.length > 0 ? (
                    dashboardData.todays_customers.map((customer, index) => (
                      <div key={index} className="fancy-customer-details">
                        <Typography className="fancy-customer-info">
                          {customer[0]}
                        </Typography>
                        <div className="fancy-offer-details">
                          <Typography className="fancy-offer-title">
                            {customer[1]}
                          </Typography>
                          <Typography className="fancy-customer-time">
                            {customer[2]}
                          </Typography>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Typography className="fancy-no-customers">
                      No customers today.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Charts Section */}
        <Grid container spacing={4} className="fancy-charts-grid">
          <Grid item xs={12} md={4}>
            <Card className="fancy-chart-card">
              <CardContent>
                <Typography className="fancy-chart-title">
                  <FaTasks className="fancy-chart-icon" /> Bookings Per Month
                </Typography>
                <Line
                  data={{
                    labels: [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ],
                    datasets: [
                      {
                        label: 'Bookings per Month',
                        data: bookingData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                      },
                    ],
                  }}
                  className="fancy-chart"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="fancy-chart-card">
              <CardContent>
                <Typography className="fancy-chart-title">
                  <FaUserFriends className="fancy-chart-icon" /> Customers Per Month
                </Typography>
                <Line
                  data={{
                    labels: [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ],
                    datasets: [
                      {
                        label: 'Customers per Month',
                        data: customerData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      },
                    ],
                  }}
                  className="fancy-chart"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="fancy-chart-card">
              <CardContent>
                <Typography className="fancy-chart-title">
                  <FaMoneyBillWave className="fancy-chart-icon" /> Sales Per Month
                </Typography>
                <Line
                  data={{
                    labels: [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ],
                    datasets: [
                      {
                        label: 'Sales per Month',
                        data: salesData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      },
                    ],
                  }}
                  className="fancy-chart"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Offers Section */}
        <Typography
          variant="h5"
          component="h2"
          className="fancy-section-title"
        >
          <FaTasks className="fancy-section-icon" /> Activities
        </Typography>
        <Grid container spacing={2} className="fancy-offers-section">
          {offers.activity_offers.length > 0 ? (
            offers.activity_offers.map((offer) => (
              <Grid item xs={12} sm={6} md={4} key={offer.id}>
                <ActivityCard activity={offer} className="fancy-offer-card" />
              </Grid>
            ))
          ) : (
            <Typography className="fancy-no-offers">
              No activity offers available
            </Typography>
          )}
        </Grid>

        <Typography
          variant="h5"
          component="h2"
          className="fancy-section-title"
        >
          <FaBoxes className="fancy-section-icon" /> Packages
        </Typography>
        <Grid container spacing={2} className="fancy-offers-section">
          {offers.package_offers.length > 0 ? (
            offers.package_offers.map((offer) => (
              <Grid item xs={12} sm={6} md={4} key={offer.id}>
                <PackageCard pkg={offer} className="fancy-offer-card" />
              </Grid>
            ))
          ) : (
            <Typography className="fancy-no-offers">
              No package offers available
            </Typography>
          )}
        </Grid>

        <Typography
          variant="h5"
          component="h2"
          className="fancy-section-title"
        >
          <FaRoute className="fancy-section-icon" /> Tours
        </Typography>
        <Grid container spacing={2} className="fancy-offers-section">
          {offers.tour_offers.length > 0 ? (
            offers.tour_offers.map((offer) => (
              <Grid item xs={12} sm={6} md={4} key={offer.id}>
                <TourCard tour={offer} className="fancy-offer-card" />
              </Grid>
            ))
          ) : (
            <Typography className="fancy-no-offers">
              No tour offers available
            </Typography>
          )}
        </Grid>

        <FormControl variant="outlined" className="fancy-filter-control">
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filter"
            className="fancy-filter-select"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={4} direction="column">
          <Grid item className="fancy-booking-section">
            <Card className="fancy-booking-card-container">
              <CardContent>
                <Typography variant="h6" component="h3">
                  <FaTasks className="fancy-section-icon" /> Activity Bookings
                </Typography>
                {renderBookingList(activityBookings, 'activity')}
              </CardContent>
            </Card>
          </Grid>
          <Grid item className="fancy-booking-section">
            <Card className="fancy-booking-card-container">
              <CardContent>
                <Typography variant="h6" component="h3">
                  <FaBoxes className="fancy-section-icon" /> Package Bookings
                </Typography>
                {renderBookingList(packageBookings, 'package')}
              </CardContent>
            </Card>
          </Grid>
          <Grid item className="fancy-booking-section">
            <Card className="fancy-booking-card-container">
              <CardContent>
                <Typography variant="h6" component="h3">
                  <FaRoute className="fancy-section-icon" /> Tour Bookings
                </Typography>
                {renderBookingList(tourBookings, 'tour')}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default SupplierBookingPage;
