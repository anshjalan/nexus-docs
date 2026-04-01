import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { addUser } from "../store/userSlice";
import api from "../utils/api";

const PublicRoute = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (user) {
          navigate("/", { replace: true });
        } else {
          const response = await api.get("/api/auth/profile");

          if (response.data?.data) {
            dispatch(addUser(response.data.data));
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        //console.error(error);
      }
    };

    checkAuth();
  }, [dispatch, user, navigate]);

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
