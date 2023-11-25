import CloseIcon from "@mui/icons-material/Close";
import { Button, Modal } from "@mui/material";
import { DateRange } from "react-date-range";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { getRoomAction } from "../redux/actions/hotelAction";
import { addDays, format } from "date-fns";
import { setError } from "../redux/slices/appSlice";
import NotFound from "./NotFound";
import Meta from "../utils/Meta";

const Booking = () => {
  const id = useParams().id;
  const user = useSelector((state) => state.userState.user);
  const { room, isLoading } = useSelector((state) => state.hotelState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dates, setDates] = useState([]);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [disableDates, setDisableDates] = useState([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const prices = room?.pricePerDay * dates?.length;
  const vat = room?.pricePerDay * dates?.length * (10 / 100);
  const totalPrice = prices + vat;
  const willCheckOut = phone.length > 9;
  const bookingDetails = {
    name,
    email,
    phone,
    totalPrice,
    dates,
    room: id,
    hotel: room?.hotel._id,
  };

  useEffect(() => {
    dispatch(getRoomAction(id));

    setName(user.name);
    setEmail(user.email);
  }, [user, id, dispatch]);

  useEffect(() => {
    if (room && room.notAvailable.length > 0) {
      const dates = room.notAvailable.map((date) => new Date(date));
      setDisableDates(dates);
    }
  }, [room]);

  useEffect(() => {
    let tempDates = [];
    let startDate = dateRange[0].startDate;
    while (startDate <= dateRange[0].endDate) {
      tempDates.push(format(new Date(startDate), "yyyy-MM-dd"));
      startDate = addDays(new Date(startDate), 1);
    }

    setDates(tempDates);
  }, [isDateOpen, dateRange]);

  const dateRangeHanler = (item) => {
    setDateRange([item.selection]);
  };

  const onCheckout = () => {
    const notAvailAble = room.notAvailable.map((date) => Date.parse(date));
    const isValidDate = dates.every(
      (date) => !notAvailAble.includes(Date.parse(date))
    );

    if (!isValidDate) {
      dispatch(setError("Ngày đã được đặt"));
      return;
    }

    sessionStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    navigate("/booking/payment");
  };

  return (
    <Fragment>
      <Meta title="Book Room" />
      <Fragment>
        {isLoading ? (
          <Loader />
        ) : (
          <Fragment>
            {!room ? (
              <NotFound />
            ) : (
              <div className="mx-auto px-4 md:px-10 lg:px-20 xl:px-48 mt-4 flex flex-col md:flex-row md:justify-between">
                <div className="flex flex-col items-start w-full md:w-auto"> 
                  <div className="px-1 sm:px-3">
                    <h2 className="text-xl font-medium mb-4">
                      Chi tiết thông tin của bạn:
                    </h2>
                    <div className="ml-8 flex items-center mb-4">
                      <label htmlFor="name" className="font-medium w-16">
                        Tên:
                      </label>
                      <input
                        value={name}
                        disabled={true}
                        id="name"
                        type="text"
                        className="outline-none py-2 px-1 sm:px-2 rounded-md border border-solid border-gray-400 text-gray-700 font-mono"
                      />
                    </div>
                    <div className="ml-8 flex items-center mb-4">
                      <label htmlFor="email" className="font-medium w-16">
                        Email:
                      </label>
                      <input
                        value={email}
                        id="email"
                        type="email"
                        className="outline-none py-2 px-1 sm:px-2  rounded-md border border-solid border-gray-400 text-gray-700 font-mono"
                        disabled={true}
                      />
                    </div>
                    <div className="ml-8 flex items-center mb-4">
                      <label htmlFor="phone" className="font-medium w-16">
                        Số điện thoại:
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại của bạn"
                        id="phone"
                        type="number"
                        className="outline-none py-2 px-1 sm:px-2 rounded-md border border-solid border-gray-400  font-mono"
                      />
                    </div>
                  </div>
                  <div className="px-0 sm:px-3">
                    <h2 className="text-xl font-medium mb-4 mt-16">
                      Chi tiết đặt phòng:
                    </h2>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Tên khách sạn:
                      </span>
                      <span className="font-mono">{room?.hotel.name}</span>
                    </div>
                    <div className="ml-10 flex mb-7">
                      <span className="font-medium inline-block  w-28">
                        Địa chỉ:
                      </span>
                      <span className="font-mono">{room?.hotel.address}</span>
                    </div>
                    <div className="ml-8 flex  mb-4">
                      <span className="font-medium inline-block  w-28">
                        Tên phòng:
                      </span>
                      <span className="font-mono">{room?.name}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Số phòng:
                      </span>
                      <span className="font-mono">{room?.number}</span>
                    </div>
                    <div className="ml-8 flex items-center mb-4">
                      <span className="font-medium inline-block  w-28">
                        Loại phòng:
                      </span>
                      <span className="font-mono">{room?.type}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block w-28">
                        Giá(1 ngày):
                      </span>
                      <span className="font-mono">
                        {room?.pricePerDay.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) + ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="px-1 sm:px-3">
                    <h2 className="text-xl font-medium mb-4 mt-16">
                      Chi tiết thanh toán:
                    </h2>
                    <div className="ml-8 flex  mb-4">
                      <span className="font-medium inline-block  w-28">
                        ID phòng:
                      </span>
                      <span className="font-mono break-all">{room?._id}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Ngày:
                      </span>
                      <button onClick={() => setIsDateOpen(!isDateOpen)}>
                        <textarea
                          value={dates.map((i) =>
                            new Date(i).toLocaleString("vi-VN", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                            })
                          )}
                          disabled={true}
                          id="phone"
                          rows={dates.length + 1}
                          cols={10}
                          className="py-2 px-1 sm:px-2 rounded-md border border-solid border-gray-400 text-gray-700 font-mono cursor-pointer break-all resize-none hover:bg-red-200 transition duration-200"
                        />
                      </button>
                      <Modal
                        disableAutoFocus={true}
                        open={isDateOpen}
                        onClose={() => setIsDateOpen(false)}
                        className="flex justify-center items-center mb-20"
                      >
                        <div className="flex flex-col bg-white pb-8 rounded-md">
                          <CloseIcon
                            fontSize="large"
                            onClick={() => setIsDateOpen(false)}
                            className="rounded-full text-red-500 cursor-pointer hover:bg-neutral-200 transition duration-200 p-1 m-2"
                          />
                          <DateRange
                            onChange={dateRangeHanler}
                            showSelectionPreview={true}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                            className="sm:px-12 sm:py-4 rounded-md"
                            minDate={new Date(Date.now())}
                            disabledDates={disableDates}
                          />
                          <div className="flex justify-center">
                            <Button
                              variant="contained"
                              className="w-72 h-12 "
                              onClick={() => setIsDateOpen(false)}
                            >
                              Xác nhận
                            </Button>
                          </div>
                        </div>
                      </Modal>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Giá({dates?.length} ngày):
                      </span>
                      <span className="font-mono">
                        {prices.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) + ""}
                      </span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Thuế:
                      </span>
                      <span className="font-mono">
                        {vat.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) + ""}
                      </span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block w-28">
                        Tổng cộng:
                      </span>
                      <span className="font-mono">
                        {totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) + ""}
                      </span>
                    </div>
                  </div>
                  <div className="px-1 sm:px-3 py-20 flex justify-center sm:justify-end items-center ">
                    <button
                      onClick={onCheckout}
                      className="py-4 w-60 block text-center rounded bg-red-400 hover:bg-red-500 transition duration-200 text-zinc-50 cursor-pointer"
                      disabled={willCheckOut ? false : true}
                    >
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    </Fragment>
  );
};
export default Booking;
