import express from 'express';

const router = express.Router();

router.get('/usertype', (req, res) => {
   res.send('userType route');
})

export default router;