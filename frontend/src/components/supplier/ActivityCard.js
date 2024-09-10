import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../services/api';
import CustomDatePicker from '../booking/CustomDatePicker';
import PeriodsDropdown from '../booking/PeriodsDropdown';
import './OfferCard.css';

const ActivityCard = ({ activity }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [stockToReserve, setStockToReserve] = useState(0);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleOfferChange = async (event) => {
        const offerId = event.target.value;
        const offer = activity.offers.find(offer => offer.id === parseInt(offerId));
        setSelectedOffer(offer);
        setSelectedPeriod(null);
        setPeriods([]);
        setSelectedDate(null);
        setSuccessMessage(null);
        setError(null);
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setSuccessMessage(null);
        setError(null);

        if (selectedOffer && date) {
            try {
                const response = await api.get(`/api/offer/${selectedOffer.id}/periods/${date}/`);
                setPeriods(response.data);
            } catch (error) {
                console.error("Failed to fetch periods", error);
                setError("Failed to fetch periods. Please try again.");
            }
        }
    };

    const handleReserve = async (maxStock = false) => {
        if (selectedOffer && selectedPeriod) {
            try {
                const number_of_reservations = maxStock ? selectedPeriod.stock : stockToReserve;
                await api.post('/api/reserve-activity/', {
                    activity_offer: selectedOffer.id,
                    period: selectedPeriod.id,
                    number_of_reservations: number_of_reservations,
                });
                setSuccessMessage(maxStock ? "Day blocked successfully" : "Reservation successful");
            } catch (error) {
                console.error("Error reserving stock", error);
                setError("Error reserving stock. Please try again.");
            }
        } else {
            setError("Please select an offer, a date, and a period first.");
        }
    };

    return (
        <Card className="offer-card">
            {activity.image && (
                <div className="offer-image-container">
                    <img src={`http://localhost:8000${activity.image}`} alt={activity.title} className="offer-image" />
                </div>
            )}
            <CardContent className="offer-content">
                <Typography variant="h5" component="h2" className="offer-title">
                    {activity.title}
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
                    {activity.offers.map(offer => (
                        <MenuItem key={offer.id} value={offer.id}>
                            {offer.title}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedOffer && (
                    <div>
                        <CustomDatePicker
                            from={activity.available_from}
                            to={activity.available_to}
                            daysOff={activity.days_off}
                            onDateChange={handleDateChange}
                        />
                        {selectedDate && periods.length > 0 && (
                            <PeriodsDropdown
                                selectedDate={selectedDate}
                                offerId={selectedOffer.id}
                                setSelectedPeriod={setSelectedPeriod}
                                selectedPeriod={selectedPeriod}
                            />
                        )}
                        {selectedDate && periods.length === 0 && (
                            <Typography variant="body2" color="textSecondary">
                                No available periods for the selected date.
                            </Typography>
                        )}
                        <TextField
                            label="Stock to Reserve"
                            type="number"
                            value={stockToReserve}
                            onChange={(e) => setStockToReserve(e.target.value)}
                            fullWidth
                            margin="normal"
                            inputProps={{ max: selectedPeriod?.stock || 0 }}
                            disabled={!selectedPeriod}
                        />
                        <div className="offer-actions">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleReserve()}
                                disabled={!selectedPeriod}
                                fullWidth
                            >
                                Reserve Stock
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleReserve(true)}
                                disabled={!selectedPeriod}
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

export default ActivityCard;
