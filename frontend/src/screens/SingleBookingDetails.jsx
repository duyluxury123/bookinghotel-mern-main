import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Fragment, useEffect, useState } from "react";
import { getBookingDetails } from "../redux/actions/hotelAction";
import Loader from "../components/Loader";
import { format } from "date-fns";
import NotFound from "./NotFound";
import Meta from "../utils/Meta";
import { getAllUsers } from "../redux/actions/userAction";

const SingleBookingDetails = () => {
  const dispatch = useDispatch();
  const id = useParams().id;
  const [dates, setDates] = useState([]);
  const { allUsers } = useSelector(
    (state) => state.userState
  );
  const { isLoading, booking } = useSelector((state) => state.hotelState);
  const prices = booking?.room.pricePerDay * dates?.length;
  const vat = booking?.room.pricePerDay * dates?.length * (10 / 100);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const userInfo = allUsers.filter((item) => item?._id === booking?.user);

  useEffect(() => {
    dispatch(getBookingDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (booking) {
      const tempDates = booking.dates.map((date) =>
        format(new Date(date), "yyyy-MM-dd")
      );
      setDates(tempDates);
    }
  }, [booking]);

  return (
    <Fragment>
      <Meta title="Single Booking details" />
      <Fragment>
        {isLoading ? (
          <Loader />
        ) : (
          <Fragment>
            {!booking ? (
              <NotFound />
            ) : (
              <div className="mx-auto px-4 md:px-10 lg:px-20 xl:px-48 mt-4 flex flex-col md:flex-row  md:justify-between">
                <div className="flex flex-col items-start w-full md:w-auto">
                  <div className="px-1 sm:px-3">
                    <h2 className="text-xl font-medium md:mt-5 mb-4">
                      Chi tiết thông tin người đặt:
                    </h2>
                    <div className="ml-8 flex items-center mb-4">
                      <label htmlFor="name" className="font-medium w-16">
                        Name:
                      </label>
                      <input
                        value={userInfo.map((i) => i.name)}
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
                        value={userInfo.map((i) => i.email)}
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
                        value={booking?.phone}
                        disabled={true}
                        placeholder="Your phone number"
                        id="phone"
                        type="number"
                        className="outline-none py-2 px-1 sm:px-2 rounded-md border border-solid border-gray-400  font-mono"
                      />
                    </div>
                  </div>
                  <div className="px-1 sm:px-3 ">
                    <h2 className="text-xl font-medium mb-4 mt-16">
                      Chi tiết đặt phòng:
                    </h2>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Tên khách sạn:
                      </span>
                      <Link
                        to={`/hotel/${booking?.hotel._id}`}
                        className="font-mono text-blue-700"
                      >
                        {booking?.hotel.name}
                      </Link>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Địa chỉ:
                      </span>
                      <span className="font-mono">
                        {booking?.hotel.address}
                      </span>
                    </div>
                    <div className="ml-8 flex  mb-4">
                      <span className="font-medium inline-block  w-28">
                        Tên phòng:
                      </span>
                      <span className="font-mono">{booking?.room.name}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Số phòng:
                      </span>
                      <span className="font-mono">{booking?.room.number}</span>
                    </div>
                    <div className="ml-8 flex items-center mb-4">
                      <span className="font-medium inline-block  w-28">
                        Loại phòng:
                      </span>
                      <span className="font-mono">{booking?.room.type}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block w-28">
                        Giá(1 ngày):
                      </span>
                      <span className="font-mono">
                        {booking?.room.pricePerDay.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) + ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="px-1 sm:px-3">
                    <h2 className="text-xl font-medium mb-4 mt-16 md:mt-5">
                      Chi tiết thanh toán:
                    </h2>
                    <div className="ml-8 flex  mb-4">
                      <span className="font-medium inline-block  w-28">
                        ID phòng:
                      </span>
                      <span className="font-mono break-all">
                        {booking?.room._id}
                      </span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block w-28">
                        {" "}
                       Ngày đặt:
                      </span>
                      <span className="font-mono">{new Date(booking?.createdAt).toLocaleString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block w-28">
                        {" "}
                        Tình trạng:
                      </span>
                      <span className="font-mono">{booking?.status}</span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block  w-28">
                        Ngày:
                      </span>
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
                        className="py-2 px-1 sm:px-2 rounded-md border border-solid border-gray-400 text-gray-700 font-mono break-all resize-none"
                      />
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
                        Tổng tiền:
                      </span>
                      <span className="font-mono">
                        {booking?.totalPrice.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) + ""}
                      </span>
                    </div>
                    <div className="ml-8 flex mb-4">
                      <span className="font-medium inline-block w-28">
                        {" "}
                        Thanh toán:
                      </span>
                      <span className="font-mono">
                        {booking?.paymentInfo.status}
                      </span>
                    </div>
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
export default SingleBookingDetails;
