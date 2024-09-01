import React, { useState, useEffect } from 'react';
import { CircularProgress, Container, Grid, Typography, Card, CardContent, Button, Alert, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import api from '../services/api';
import ActivityCard from './supplier/ActivityCard';
import TourCard from './supplier/TourCard';
import PackageCard from './supplier/PackageCard';
import './Booking.css';

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
      const [activitiesResponse, packagesResponse, toursResponse, dashboardResponse] = await Promise.all([
        api.get('/api/supplier/bookings/'),
        api.get('/api/supplier/packagesb/'),
        api.get('/api/supplier/toursb/'),
        api.get('/api/supplier-dashboard/'),
      ]);

      setActivityBookings(activitiesResponse.data || []);
      setPackageBookings(packagesResponse.data || []);
      setTourBookings(toursResponse.data || []);
      setDashboardData(dashboardResponse.data || {});

      const [bookingsPerMonth, customersPerMonth, salesPerMonth] = await Promise.all([
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

  const filterBookings = (bookings = []) => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => {
      if (filter === 'paid') return booking.paid;
      if (filter === 'unpaid') return !booking.paid;
      if (filter === 'confirmed') return booking.confirmed;
      if (filter === 'unconfirmed') return !booking.confirmed;
      return true;
    });
  };

  const renderBookingList = (bookings = [], type) => (
    <Grid container spacing={2}>
      {bookings.length > 0 ? filterBookings(bookings).map(booking => {
        const imageUrl = booking.period?.activity_offer?.activity?.image || booking.tourday?.tour_offer?.tour?.image || booking.package_offer?.package?.image;
        const title = booking.period?.activity_offer?.activity?.title || booking.tourday?.tour_offer?.tour?.title || booking.package_offer?.package?.title || 'Booking';
        const price = (booking.period?.activity_offer?.price || booking.tourday?.tour_offer?.price || booking.package_offer?.price || 0) * booking.quantity;
        const day = booking.period?.day || booking.tourday?.day || booking.start_date;
        const startTime = booking.period?.time_from || booking.tourday?.tour_offer?.tour?.pickup_time || booking.start_date;
        const endTime = booking.period?.time_to || booking.tourday?.tour_offer?.tour?.dropoff_time || booking.end_date;
        const customerUsername = booking.customer?.user?.username;
        const customerEmail = booking.customer?.user?.email;
        const customerPhone = booking.customer?.user?.phone;

        return (
          <Grid item xs={12} sm={6} md={4} key={booking.id}>
            <Card className="booking-card">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  className="booking-image"
                  alt="Booking"
                />
              )}
              <CardContent className="booking-content">
                <Typography variant="h5" component="h2" className="booking-info">
                  {title}
                </Typography>
                <Typography variant="body2" className="booking-info">
                  Price: ${price}
                </Typography>
                <Typography variant="body2" className="booking-info">
                  Day: {day}
                </Typography>
                <Typography variant="body2" className="booking-info">
                  Starts at: {startTime}
                </Typography>
                <Typography variant="body2" className="booking-info">
                  Ends at: {endTime}
                </Typography>
                {customerUsername && (
                  <Typography variant="body2" className="booking-info">
                    Customer: {customerUsername}
                  </Typography>
                )}
                {customerEmail && (
                  <Typography variant="body2" className="booking-info">
                    Email: {customerEmail}
                  </Typography>
                )}
                {customerPhone && (
                  <Typography variant="body2" className="booking-info">
                    Phone: {customerPhone}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      }) : <Typography className="no-bookings">No bookings available</Typography>}
    </Grid>
  );

  if (loading) return <Container className="container"><CircularProgress /></Container>;
  if (error) return <Container className="container"><Alert severity="error">Error loading data: {error.message}</Alert></Container>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container className="container">
        <Typography variant="h4" component="h1" gutterBottom className="section-title">
          Supplier Dashboard
        </Typography>

        {dashboardData && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className="summary-card">
                <CardContent className='unconfirmed'>
                  <Typography className="card-title">
                    Unconfirmed Bookings: {dashboardData.unconfirmed_bookings || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="summary-card">
                <CardContent>
                  <Typography className="card-title">
                    Today's Customers
                  </Typography>
                  {dashboardData.todays_customers && dashboardData.todays_customers.length > 0 ? (
                    dashboardData.todays_customers.map((customer, index) => (
                      <div key={index}>
                        <Typography className="customer-info">
                          {customer[0]}
                        </Typography>
                        <div className="offer-details">
                          <Typography className="offer-title">
                            {customer[1]}
                          </Typography>
                          <Typography className="customer-time">
                            {customer[2]}
                          </Typography>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Typography className="no-customers">
                      No customers today.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Typography variant="h5" component="h2" className="section-title">
          Your Offers
        </Typography>
        <Grid container spacing={2}>
          {offers.activity_offers.length > 0 ? offers.activity_offers.map((offer) => (
            <ActivityCard key={offer.id} activity={offer} />
          )) : <Typography>No activity offers available</Typography>}
          {offers.tour_offers.length > 0 ? offers.tour_offers.map((offer) => (
            <TourCard key={offer.id} tour={offer} />
          )) : <Typography>No tour offers available</Typography>}
          {offers.package_offers.length > 0 ? offers.package_offers.map((offer) => (
            <PackageCard key={offer.id} pkg={offer} />
          )) : <Typography>No package offers available</Typography>}
        </Grid>

        <FormControl variant="outlined" className="filter-control">
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filter"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={4} direction="column">
          <Grid item className="booking-cards">
            <Card className="booking-card">
              <CardContent>
                <Typography variant="h5" component="h3">
                  Activity Bookings
                </Typography>
                {renderBookingList(activityBookings, 'activity')}
              </CardContent>
            </Card>
          </Grid>
          <Grid item className="booking-cards">
            <Card className="booking-card">
              <CardContent>
                <Typography variant="h5" component="h3">
                  Package Bookings
                </Typography>
                {renderBookingList(packageBookings, 'package')}
              </CardContent>
            </Card>
          </Grid>
          <Grid item className="booking-cards">
            <Card className="booking-card">
              <CardContent>
                <Typography variant="h5" component="h3">
                  Tour Bookings
                </Typography>
                {renderBookingList(tourBookings, 'tour')}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card className="chart-card">
              <CardContent>
                <Typography variant="h6" component="h4">Bookings Per Month</Typography>
                <Line data={{
                  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                  datasets: [{
                    label: 'Bookings per Month',
                    data: bookingData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  }]
                }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="chart-card">
              <CardContent>
                <Typography variant="h6" component="h4">Customers Per Month</Typography>
                <Line data={{
                  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                  datasets: [{
                    label: 'Customers per Month',
                    data: customerData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  }]
                }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="chart-card">
              <CardContent>
                <Typography variant="h6" component="h4">Sales Per Month</Typography>
                <Line data={{
                  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                  datasets: [{
                    label: 'Sales per Month',
                    data: salesData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  }]
                }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default SupplierBookingPage;
