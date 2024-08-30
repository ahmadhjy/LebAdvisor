import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../services/api';
import TourDatePicker from '../booking/TourDatePicker';

const TourCard = ({ tour }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [availableTourDays, setAvailableTourDays] = useState([]);
    const [selectedTourDay, setSelectedTourDay] = useState(null);
    const [stockToReserve, setStockToReserve] = useState(0);

    const handleOfferChange = async (event) => {
        const offerId = event.target.value;
        const offer = tour.offers.find(offer => offer.id === parseInt(offerId));
        setSelectedOffer(offer);
        setSelectedTourDay(null);
        setAvailableTourDays([]);

        if (offer) {
            try {
                const response = await api.get(`/api/tourdays/${offer.id}/`);
                setAvailableTourDays(response.data);
            } catch (error) {
                console.error("Failed to fetch tour days", error);
            }
        }
    };

    const handleDateChange = (date) => {
        const tourDay = availableTourDays.find(day => day.day === date);
        setSelectedTourDay(tourDay);
        setStockToReserve(0);
    };

    const handleReserve = async () => {
        if (selectedOffer && selectedTourDay) {
            try {
                await api.post('/api/reserve-tour/', {
                    tour_offer: selectedOffer.id,
                    tour_day: selectedTourDay.id,
                    number_of_reservations: stockToReserve,
                });
                alert("Reservation successful");
            } catch (error) {
                console.error("Error reserving stock", error);
            }
        } else {
            alert("Please select an offer and a date first.");
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {tour.title}
                </Typography>
                <TextField
                    select
                    label="Select Offer"
                    value={selectedOffer?.id || ''}
                    onChange={handleOfferChange}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="">Select Offer</MenuItem>
                    {tour.offers.map(offer => (
                        <MenuItem key={offer.id} value={offer.id}>
                            {offer.title} - ${offer.price}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedOffer && (
                    <>
                        <TourDatePicker
                            availableTourDays={availableTourDays.map(day => day.day)}
                            onDateChange={handleDateChange}
                        />
                        <TextField
                            label="Stock to Reserve"
                            type="number"
                            value={stockToReserve}
                            onChange={(e) => setStockToReserve(e.target.value)}
                            fullWidth
                            margin="normal"
                            disabled={!selectedTourDay}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReserve}
                            disabled={!selectedTourDay}
                            fullWidth
                        >
                            Reserve Stock
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TourCard;
