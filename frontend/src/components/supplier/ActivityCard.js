import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../services/api';
import CustomDatePicker from '../booking/CustomDatePicker';
import PeriodsDropdown from '../booking/PeriodsDropdown';

const ActivityCard = ({ activity }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [stockToReserve, setStockToReserve] = useState(0);
    const [error, setError] = useState(null);

    const handleOfferChange = async (event) => {
        const offerId = event.target.value;
        const offer = activity.offers.find(offer => offer.id === parseInt(offerId));
        setSelectedOffer(offer);
        setSelectedPeriod(null);
        setPeriods([]);
        setSelectedDate(null);
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);

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

    const handleReserve = async () => {
        if (selectedOffer && selectedPeriod) {
            try {
                await api.post('/api/reserve-activity/', {
                    activity_offer: selectedOffer.id,
                    period: selectedPeriod.id,
                    number_of_reservations: stockToReserve,
                });
                alert("Reservation successful");
            } catch (error) {
                console.error("Error reserving stock", error);
                setError("Error reserving stock. Please try again.");
            }
        } else {
            setError("Please select an offer, a date, and a period first.");
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
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
                            {offer.title} - ${offer.price}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedOffer && (
                    <>
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
                            disabled={!selectedPeriod}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReserve}
                            disabled={!selectedPeriod}
                            fullWidth
                        >
                            Reserve Stock
                        </Button>
                        {error && (
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityCard;
