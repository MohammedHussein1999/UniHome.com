import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function ProtectedRouterLog(props) {
    const token = Cookies.get("accessToken");
  if (token) {
    return <Navigate to={"/"}></Navigate>;
  } else {
    return props.children;
  }
}