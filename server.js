const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use(cors()); // Dodano korištenje cors middleware-a za omogućavanje CORS-a

// Povezivanje s bazom podataka
mongoose.connect('mongodb+srv://nikola:nikola@cluster0.spnnj.mongodb.net/holidayHome?authSource=admin&replicaSet=atlas-6knp83-shard-0&readPreference=primary&ssl=true')
    .then(() => {
        console.log('Uspješno spojeni na bazu podataka');
    })
    .catch((error) => {
        console.error('Greška prilikom spajanja na bazu podataka:', error);
    });


mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected');
});

// Definiranje Mongoose modela
const bookingSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
},{ timestamps: true } );

const Booking = mongoose.model('Booking', bookingSchema);

// Definiranje ruta
const router = express.Router();

// Dohvat svih rezerviranih datuma
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        const reservedDates = bookings.map(booking => ({
            startDate: booking.startDate,
            endDate: booking.endDate
        }));
        res.json(reservedDates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Dodavanje nove rezervacije
router.post('/bookings', async (req, res) => {
    const booking = new Booking({
        startDate: req.body.startDate,
        endDate: req.body.endDate,
    });
    try {
        const newBooking = await booking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ažuriranje postojeće rezervacije
router.patch('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking == null) {
            return res.status(404).json({ message: 'Rezervacija nije pronađena' });
        }
        if (req.body.startDate != null) {
            booking.startDate = req.body.startDate;
        }
        if (req.body.endDate != null) {
            booking.endDate = req.body.endDate;
        }
        await booking.save();
        res.json({ message: 'Rezervacija ažurirana' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Brisanje postojeće rezervacije
router.delete('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking == null) {
            return res.status(404).json({ message: 'Rezervacija nije pronađena' });
        }
        await booking.remove();
        res.json({ message: 'Rezervacija obrisana' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Pokretanje poslužitelja nakon što se poveže s bazom podataka
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Upotreba ruta
app.use('/api', router);
