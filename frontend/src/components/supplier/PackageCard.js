import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../services/api';
import PackageDatePicker from '../booking/PackageDatePicker';

const PackageCard = ({ pkg }) => {
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [availablePackageDays, setAvailablePackageDays] = useState([]);
    const [selectedPackageDay, setSelectedPackageDay] = useState(null);
    const [stockToReserve, setStockToReserve] = useState(0);

    const handleOfferChange = async (event) => {
        const offerId = event.target.value;
        const offer = pkg.offers.find(offer => offer.id === parseInt(offerId));
        setSelectedOffer(offer);
        setSelectedPackageDay(null);
        setAvailablePackageDays([]);

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
    };

    const handleReserve = async () => {
        if (selectedOffer && selectedPackageDay) {
            try {
                await api.post('/api/reserve-package/', {
                    package_offer: selectedOffer.id,
                    package_day: selectedPackageDay.id,
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
                            {offer.title} - ${offer.price}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedOffer && (
                    <>
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
                            disabled={!selectedPackageDay}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReserve}
                            disabled={!selectedPackageDay}
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

export default PackageCard;
