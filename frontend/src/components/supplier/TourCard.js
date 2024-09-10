import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../services/api';
import TourDatePicker from '../booking/TourDatePicker';
import './OfferCard.css';

const TourCard = ({ tour }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [availableTourDays, setAvailableTourDays] = useState([]);
    const [selectedTourDay, setSelectedTourDay] = useState(null);
    const [stockToReserve, setStockToReserve] = useState(0);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleOfferChange = async (event) => {
        const offerId = event.target.value;
        const offer = tour.offers.find(offer => offer.id === parseInt(offerId));
        setSelectedOffer(offer);
        setSelectedTourDay(null);
        setAvailableTourDays([]);
        setSuccessMessage(null);
        setError(null);

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
        setSuccessMessage(null);
        setError(null);
    };

    const handleReserve = async (maxStock = false) => {
        if (selectedOffer && selectedTourDay) {
            try {
                const number_of_reservations = maxStock ? selectedTourDay.stock : stockToReserve;
                await api.post('/api/reserve-tour/', {
                    tour_offer: selectedOffer.id,
                    tour_day: selectedTourDay.id,
                    number_of_reservations: number_of_reservations,
                });
                setSuccessMessage(maxStock ? "Day blocked successfully" : "Reservation successful");
            } catch (error) {
                console.error("Error reserving stock", error);
                setError("Error reserving stock. Please try again.");
            }
        } else {
            setError("Please select an offer and a date first.");
        }
    };

    return (
        <Card className="offer-card">
            {tour.image && (
                <div className="offer-image-container">
                    <img src={`http://localhost:8000${tour.image}`} alt={tour.title} className="offer-image" />
                </div>
            )}
            <CardContent className="offer-content">
                <Typography variant="h5" component="h2" className="offer-title">
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
                            {offer.title}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedOffer && (
                    <div>
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
                            inputProps={{ max: selectedTourDay?.stock || 0 }}
                            disabled={!selectedTourDay}
                        />
                        <div className="offer-actions">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleReserve()}
                                disabled={!selectedTourDay}
                                fullWidth
                            >
                                Reserve Stock
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleReserve(true)}
                                disabled={!selectedTourDay}
                                fullWidth
                                style={{ marginTop: '10px' }}
                            >
                                Block Day (Reserve All)
                            </Button>
                        </div>
                        {successMessage && (
                            <Typography variant="body2" color="primary" className="success-message">
                                {successMessage}
                            </Typography>
                        )}
                        {error && (
                            <Typography variant="body2" color="error" className="error-message">
                                {error}
                            </Typography>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TourCard;
