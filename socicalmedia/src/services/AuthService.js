import {BASE_URL_SERVER} from "../config/server";
import axios from "axios";

const API_ENDPOINT = {
    LOGOUT: "/api/users/list",
}

class AuthService {
    logout = () => {
        return axios.get(BASE_URL_SERVER + API_ENDPOINT.LOGOUT);
    }

}

const authService = new AuthService();
export default authService;