import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import Meta from '../utils/Meta';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Fragment>
            <Meta title="Page Not Found" />
            <div className="flex flex-col justify-center w-full items-center h-[calc(100vh-97px)]">
                <h2 className="text-2xl -mt-48 mb-6 text-center">Không tìm thấy trang.</h2>
                <button className="bg-red-400 hover:bg-red-500 py-3 px-6 rounded text-green-50 transition duration-200" onClick={() => navigate('/')}>Trang chủ</button>
            </div>
        </Fragment>
    )
}
export default NotFound;