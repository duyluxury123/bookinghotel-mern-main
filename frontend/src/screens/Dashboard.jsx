import SideBar from "../components/SideBar";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../redux/actions/userAction";
import { getAllBookings, getAllHotels } from "../redux/actions/hotelAction";
import { Fragment, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  Title,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Meta from "../utils/Meta";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const allUsers = useSelector((state) => state.userState.allUsers);
  const { allBookings, allHotels } = useSelector((state) => state.hotelState);
  const allDates = allBookings?.map((booking) => booking.createdAt);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllBookings());
    dispatch(getAllHotels());
  }, [dispatch]);

  const generateMonthlyBookingCount = (dates) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    const monthCounts = monthNames.reduce((counts, name) => {
      counts[name] = 0;
      return counts;
    }, {});

    dates.forEach((date) => {
      const monthName = monthNames[new Date(date).getMonth()];
      monthCounts[monthName]++;
    });

    return monthCounts;
  };

  const generateMonthlyRevenue = (dates) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    const monthRevenues = monthNames.reduce((revenues, name) => {
      revenues[name] = 0; // Khởi tạo doanh thu hàng tháng là 0
      return revenues;
    }, {});

    allBookings.forEach((booking) => {
      const monthName = monthNames[new Date(booking.createdAt).getMonth()];
      monthRevenues[monthName] += booking.totalPrice;
    });

    return monthRevenues;
  };

  const revenueState = {
    labels: Object.keys(generateMonthlyRevenue(allDates)),
    datasets: [
      {
        label: "Doanh thu",
        data: Object.values(generateMonthlyRevenue(allDates)),
        backgroundColor: "blue", // Màu của cột biểu đồ
        hoverBackgroundColor: "lightblue",
      },
    ],
  };

  const lineState = {
    labels: Object.keys(generateMonthlyBookingCount(allDates)),
    datasets: [
      {
        label: "Lượt đặt",
        data: Object.values(generateMonthlyBookingCount(allDates)),
        backgroundColor: "tomato",
        hoverBackgroundColor: "rgb(197, 72, 49)",
      },
    ],
  };

  const options = {
    maintainAspectRation: true,
  };

  return (
    <Fragment>
      <Meta title="Admin Dashboard" />
      <div className="flex">
        <SideBar />
        <div className="mx-auto w-full lg:mt-16 sm:mt-8 mt-5 md:mt-12">
          <h2 className="text-center mb-12 font-medium text-2xl text-red-400">
            Quản Lý Khách Sạn
          </h2>
          <div className=" px-4 lg:px-20 flex flex-col gap-5 sm:gap-8 md:gap-12 lg:gap-28 sm:flex-row sm:justify-center">
            <Card className="px-5 py-3 shadow-2xl sm:w-1/4 sm:px-2 sm:py-2 !bg-zinc-200">
              <CardContent className="w-full flex justify-between items-center sm:aspect-square sm:flex-col-reverse sm:justify-center">
                <div className="text-center">
                  <Link
                    to="/admin/users"
                    className="text-3xl font-medium text-red-500"
                  >
                    {" "}
                    {allUsers.length}
                  </Link>
                  <p className="text-gray-500 text-md">
                    {"Người dùng"}
                  </p>
                </div>
                <PeopleAltIcon className="text-red-400 !text-4xl mb-4" />
              </CardContent>
            </Card>
            <Card className="px-5 py-3 shadow-2xl sm:w-1/4 sm:px-2 sm:py-2 !bg-zinc-200">
              <CardContent className="w-full flex justify-between items-center sm:aspect-square sm:flex-col-reverse sm:justify-center">
                <div className="text-center">
                  <Link
                    to="/admin/hotels"
                    className="text-3xl font-medium text-red-500"
                  >
                    {" "}
                    {allHotels.length}
                  </Link>
                  <p className="text-gray-500 text-md">
                    {"Khách sạn"}
                  </p>
                </div>
                <ApartmentIcon className="text-red-400 !text-4xl mb-4" />
              </CardContent>
            </Card>
            <Card className="px-5 py-3 shadow-2xl sm:w-1/4 sm:px-2 sm:py-2 !bg-zinc-200">
              <CardContent className="w-full flex justify-between items-center sm:aspect-square sm:flex-col-reverse sm:justify-center">
                <div className="text-center">
                  <Link
                    to="/admin/bookings"
                    className="text-3xl font-medium text-red-500"
                  >
                    {" "}
                    {allBookings.length}
                  </Link>
                  <p className="text-gray-500 text-md">
                    {"Lượt đặt phòng"}
                  </p>
                </div>
                <BookmarkAddedIcon className="text-red-400 !text-4xl mb-4" />
              </CardContent>
            </Card>
          </div>
          <div className="w-11/12 md:w-3/5 aspect-auto my-20 mx-auto">
            <h2 className="text-center mb-8 font-medium text-xl text-red-400">
              Thống kê lượt đặt hàng tháng
            </h2>
            <Bar data={lineState} options={options} className="w-full" />
          </div>
          <div className="w-11/12 md:w-3/5 aspect-auto my-20 mx-auto">
            <h2 className="text-center mb-8 font-medium text-xl text-blue-600">
              Thống kê doanh thu hàng tháng
            </h2>
            <Bar data={revenueState} options={options} className="w-full" />
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Dashboard;
