import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../services/api';
import PackageDatePicker from '../booking/PackageDatePicker';
import './OfferCard.css';

const PackageCard = ({ pkg }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [availablePackageDays, setAvailablePackageDays] = useState([]);
    const [selectedPackageDay, setSelectedPackageDay] = useState(null);
    const [stockToReserve, setStockToReserve] = useState(0);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleOfferChange = async (event) => {
        const offerId = event.target.value;
        const offer = pkg.offers.find(offer => offer.id === parseInt(offerId));
        setSelectedOffer(offer);
        setSelectedPackageDay(null);
        setAvailablePackageDays([]);
        setSuccessMessage(null);
        setError(null);

        if (offer) {
            try {
                const response = await api.get(`/api/packagedays/${offer.id}/`);
                setAvailablePackageDays(response.data);
            } catch (error) {
                console.error("Failed to fetch package days", error);
            }
        }
    };

    const handleDateChange = (date) => {
        const packageDay = availablePackageDays.find(day => day.day === date);
        setSelectedPackageDay(packageDay);
        setStockToReserve(0);
        setSuccessMessage(null);
        setError(null);
    };

    const handleReserve = async (maxStock = false) => {
        if (selectedOffer && selectedPackageDay) {
            try {
                const number_of_reservations = maxStock ? selectedPackageDay.stock : stockToReserve;
                await api.post('/api/reserve-package/', {
                    package_offer: selectedOffer.id,
                    package_day: selectedPackageDay.id,
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
            {pkg.image && (
                <div className="offer-image-container">
                    <img src={`http://localhost:8000${pkg.image}`} alt={pkg.title} className="offer-image" />
                </div>
            )}
            <CardContent className="offer-content">
                <Typography variant="h5" component="h2" className="offer-title">
                    {pkg.title}
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
                    {pkg.offers.map(offer => (
                        <MenuItem key={offer.id} value={offer.id}>
                            {offer.title}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedOffer && (
                    <div>
                        <PackageDatePicker
                            availablePackageDays={availablePackageDays.map(day => day.day)}
                            onDateChange={handleDateChange}
                        />
                        <TextField
                            label="Stock to Reserve"
                            type="number"
                            value={stockToReserve}
                            onChange={(e) => setStockToReserve(e.target.value)}
                            fullWidth
                            margin="normal"
                            inputProps={{ max: selectedPackageDay?.stock || 0 }}
                            disabled={!selectedPackageDay}
                        />
                        <div className="offer-actions">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleReserve()}
                                disabled={!selectedPackageDay}
                                fullWidth
                            >
                                Reserve Stock
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleReserve(true)}
                                disabled={!selectedPackageDay}
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

export default PackageCard;
