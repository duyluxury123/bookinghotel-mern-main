import { useNavigate } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Popover from '@mui/material/Popover';
import { Fragment, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction } from '../redux/actions/userAction';
import {setHasSearched} from '../redux/slices/hotelSlice'
import "./NavbarCss.css"

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.userState);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogoClick = () => {
        navigate('/');
        dispatch(setHasSearched(false));
    }

    const loginHandler = () => {
        navigate('/login');
        setAnchorEl(null);
    }

    const signupHandler = () => {
        navigate('/signup');
        setAnchorEl(null);
    }

    const accountHandler = () => {
        setAnchorEl(null);
        navigate('/account');
    }

    const logoutHandler = () => {
        dispatch(logoutAction());
        setAnchorEl(null)
    }

    return (
        <header className="mx-auto px-4 md:px-10 lg:px-20 xl:px-48 z-[1300]">
        <div className=" h-24 flex items-center justify-between relative">
            <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-8 h-8 mr-2 -rotate-90"> <path strokeLinecap="round" strokeLinejoin="round" stroke="#ff7474" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /> </svg>
            <h3 onClick={handleLogoClick} className=" logoText text-red-400 text-3xl font-bold cursor-pointer">LX HOTEL</h3>
            </div>
            <div className="">
                <div onClick={handleClick}>
                    <span className="md:hidden">
                        <AccountCircleIcon className="text-red-400 cursor-pointer" />
                    </span>
                    <div class="user-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 ">
  <path stroke-linecap="round" stroke-linejoin="round" stroke="#ff7474" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>

                    <span className="capitalize text-red-400 font-medium hidden md:block cursor-pointer">{isAuthenticated ? user.name : "Đăng Nhập"}</span>
                </div>
                </div>
                
                    <Popover
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right"
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}


                    >
               
                        <div className="bg-red-100 w-screen sm:w-96 py-12 flex justify-center items-center flex-col gap-6 transition ease-in duration-300">
                            {!isAuthenticated && (
                                <Fragment>
                                    <button onClick={loginHandler} className="bg-red-400 hover:bg-red-500 py-2 rounded-lg w-48 text-center text-neutral-50 font-thin transition duration-200 ">Đăng nhập</button>
                                    <button onClick={signupHandler} className=" border-red-400 text-red-400 hover:text-red-500 hover:border-red-500 hover:bg-red-200 border-solid border py-2 rounded-lg w-48 text-center transition duration-200 box-border">Đăng ký</button>
                                </Fragment>
                            )}
                            {isAuthenticated && (
                                <Fragment>
                                    <div className="text-center">
                                        <h2 className="capitalize text-xl font-semibold">Xin chào, {user.name}</h2>
                                        <span>Email: {user.email}</span>
                                    </div>
                                    <button onClick={accountHandler} className="bg-red-400 hover:bg-red-500 py-2 rounded-lg w-48 text-center text-neutral-50  transition duration-200 font-semibold">Tài khoản</button>
                                    <button onClick={logoutHandler} className=" border-red-400 text-red-400 hover:text-red-500 hover:border-red-500 hover:bg-red-200 border-solid border py-2 rounded-lg w-48 text-center transition duration-200 box-border">Đăng xuất</button>
                                </Fragment>
                            )}
                        </div>
                    </Popover>
                </div>
            </div>
        </header >
    )
}
export default Navbar;