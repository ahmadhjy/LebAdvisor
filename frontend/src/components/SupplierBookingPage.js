import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Card, CardContent } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';  // Import all required components from chart.js
import api from '../services/api';
import ActivityCard from './supplier/ActivityCard';
import TourCard from './supplier/TourCard';
import PackageCard from './supplier/PackageCard';

// Register all the necessary scales and components with ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SupplierBookingPage = () => {
    const [activities, setActivities] = useState([]);
    const [tours, setTours] = useState([]);
    const [packages, setPackages] = useState([]);
    const [dashboardData, setDashboardData] = useState({});
    const [bookingData, setBookingData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const fetchBookings = async () => {
        try {
            const [activitiesResponse, packagesResponse, toursResponse, dashboardResponse] = await Promise.all([
                api.get('/api/supplier/bookings/'),
                api.get('/api/supplier/packagesb/'),
                api.get('/api/supplier/toursb/'),
                api.get('/api/supplier-dashboard/'),
            ]);

            setDashboardData(dashboardResponse.data || {});

            // Fetch data for charts
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
            setActivities(response.data.activity_offers || []);
            setTours(response.data.tour_offers || []);
            setPackages(response.data.package_offers || []);
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchOffers();
    }, []);

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

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                type: 'category',
                labels: months,
            },
            y: {
                type: 'linear',
            },
        },
    };

    const bookingChartData = {
        labels: months,
        datasets: [
            {
                label: 'Bookings per Month',
                data: months.map((_, index) => bookingData[index] || 0),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
            },
        ],
    };

    const customerChartData = {
        labels: months,
        datasets: [
            {
                label: 'Customers per Month',
                data: months.map((_, index) => customerData[index] || 0),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
            },
        ],
    };

    const salesChartData = {
        labels: months,
        datasets: [
            {
                label: 'Sales per Month',
                data: months.map((_, index) => salesData[index] || 0),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    if (loading) return <Container><CircularProgress /></Container>;
    if (error) return <Container><Alert severity="error">Error loading data: {error.message}</Alert></Container>;

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Supplier Dashboard
            </Typography>

            {dashboardData && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography>
                                    Unconfirmed Bookings: {dashboardData.unconfirmed_bookings || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography>
                                    Today's Customers
                                </Typography>
                                {dashboardData.todays_customers && dashboardData.todays_customers.length > 0 ? (
                                    dashboardData.todays_customers.map((customer, index) => (
                                        <div key={index}>
                                            <Typography>{customer[0]}</Typography>
                                            <Typography>{customer[1]}</Typography>
                                            <Typography>{customer[2]}</Typography>
                                        </div>
                                    ))
                                ) : (
                                    <Typography>No customers today.</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Typography variant="h5" component="h2" className="section-title">
                Your Activities
            </Typography>
            <Grid container spacing={2}>
                {activities.length > 0 ? activities.map(item => <ActivityCard key={item.id} activity={item} />) : <Typography>No activities available</Typography>}
            </Grid>

            <Typography variant="h5" component="h2" className="section-title">
                Your Tours
            </Typography>
            <Grid container spacing={2}>
                {tours.length > 0 ? tours.map(item => <TourCard key={item.id} tour={item} />) : <Typography>No tours available</Typography>}
            </Grid>

            <Typography variant="h5" component="h2" className="section-title">
                Your Packages
            </Typography>
            <Grid container spacing={2}>
                {packages.length > 0 ? packages.map(item => <PackageCard key={item.id} pkg={item} />) : <Typography>No packages available</Typography>}
            </Grid>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography>Bookings Per Month</Typography>
                            <Line data={bookingChartData} options={chartOptions} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography>Customers Per Month</Typography>
                            <Line data={customerChartData} options={chartOptions} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography>Sales Per Month</Typography>
                            <Line data={salesChartData} options={chartOptions} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <FormControl variant="outlined" className="filter-control">
                <InputLabel>Filter</InputLabel>
                <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Filter"
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="unpaid">Unpaid</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
                </Select>
            </FormControl>

            <Grid container spacing={4}>
                {/* Add your existing booking lists or other components here */}
            </Grid>
        </Container>
    );
};

export default SupplierBookingPage;

