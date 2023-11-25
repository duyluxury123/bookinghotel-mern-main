import { useEffect, useState, forwardRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Booking from "./screens/Booking.jsx";
import Home from "./screens/Home.jsx";
import Hotel from "./screens/Hotel.jsx";
import SignIn from "./screens/SignIn.jsx";
import SignUp from "./screens/SignUp.jsx";
import Account from "./screens/Account.jsx";
import Bookings from "./screens/Bookings.jsx";
import Payment from "./screens/Payment.jsx";
import BookingSuccess from "./screens/BookingSuccess.jsx";
import AllUsers from "./screens/AllUsers.jsx";
import AllHotels from "./screens/AllHotels.jsx";
import CreateHotel from "./screens/CreateHotel.jsx";
import AllBookings from "./screens/AllBookings.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import UpdateProfile from "./screens/UpdateProfile.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import { getUserAction } from "./redux/actions/userAction.js";
import { setError, clearError, clearSuccess } from "./redux/slices/appSlice.js";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import BookingDetails from "./screens/BookingDetails.jsx";
import { Alert, Snackbar } from "@mui/material";
import UpdateHotel from "./screens/UpdateHotel.jsx";
import HotelRooms from "./screens/HotelRooms.jsx";
import CreateRoom from "./screens/CreateRoom.jsx";
import UpdateRoom from "./screens/UpdateRoom.jsx";
import SingleBookingDetails from "./screens/SingleBookingDetails.jsx";
import NotFound from "./screens/NotFound.jsx";
import { HelmetProvider } from "react-helmet-async";

const App = () => {
  const [stripeApiKey, setStripeApiKey] = useState("");
  const isAuthenticated = useSelector(
    (state) => state.userState.isAuthenticated
  );
  const { error, success } = useSelector((state) => state.appState);
  const dispatch = useDispatch();
  const [isStripeLoading, setStripeLoading] = useState(true);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const CustomAlert = forwardRef((props, ref) => (
    <Alert elevation={6} variant="filled" {...props} ref={ref} />
  ));

  useEffect(() => {
    dispatch(getUserAction());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      const getStripeApiKey = async () => {
        try {
          setStripeLoading(true);
          const { data } = await axios.get("/api/v1/stripeapikey");
          setStripeApiKey(data.stripeApiKey);
          setStripeLoading(false);
        } catch (err) {
          dispatch(setError(err.response.data.message));
          setStripeLoading(false);
        }
      };
      getStripeApiKey();
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (error) {
      setIsErrorOpen(true);
    } else if (success) {
      setIsSuccessOpen(true);
    }
  }, [error, success]);

  const handleErrorClose = () => {
    setIsErrorOpen(false);
    dispatch(clearError());
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    dispatch(clearSuccess());
  };

  return (
    <HelmetProvider>
      <Router>
        <div className="bg-slate-50 min-h-screen">
          <Navbar />
          <hr className=" border-t border-grey-400" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/hotel/:id" element={<Hotel />} />
            {!isStripeLoading && (
              <Route
                path="/booking/payment"
                element={
                  <ProtectedRoute>
                    <Elements stripe={loadStripe(stripeApiKey)}>
                      <Payment />
                    </Elements>
                  </ProtectedRoute>
                }
              />
            )}
            <Route
              path="/room/:id/book"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/success"
              element={
                <ProtectedRoute>
                  <BookingSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />{" "}
                </ProtectedRoute>
              }
            />
            <Route
              path="/me/update"
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me/booking/:id"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me/booking/:id/cancel"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/me/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="admin">
                  <AllUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotels"
              element={
                <ProtectedRoute role="admin">
                  <AllHotels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotel/new"
              element={
                <ProtectedRoute role="admin">
                  <CreateHotel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotel/:id/update"
              element={
                <ProtectedRoute role="admin">
                  <UpdateHotel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotel/:id/rooms"
              element={
                <ProtectedRoute role="admin">
                  <HotelRooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hotel/:id/room/new"
              element={
                <ProtectedRoute role="admin">
                  <CreateRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/room/:id/update"
              element={
                <ProtectedRoute role="admin">
                  <UpdateRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute role="admin">
                  <AllBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/booking/:id"
              element={
                <ProtectedRoute role="admin">
                  <SingleBookingDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/*" element={<NotFound />} />
          </Routes>
          <Snackbar
            open={isErrorOpen}
            autoHideDuration={3000}
            onClose={handleErrorClose}>
            <CustomAlert
              onClose={handleErrorClose}
              severity="error"
              className="w-fit mx-auto md:mr-auto ">
              {error}
            </CustomAlert>
          </Snackbar>
          <Snackbar
            open={isSuccessOpen}
            autoHideDuration={3000}
            onClose={handleSuccessClose}>
            <CustomAlert
              onClose={handleSuccessClose}
              severity="success"
              className="w-fit mx-auto md:mr-auto ">
              {success}
            </CustomAlert>
          </Snackbar>
        </div>
          <Footer/>
      </Router>
    </HelmetProvider>
  );
};

export default App;
