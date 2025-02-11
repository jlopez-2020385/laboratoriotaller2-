import { Router } from "express";
import { saveAppointment,listappointment ,updateAppointment,cancelAppointment} from "./appointment.controller.js";
import { createAppointmentValidator } from "../middlewares/appointment-validators.js";

const router = Router();

router.post("/createAppointment", createAppointmentValidator, saveAppointment);

router.get("/listappointment",listappointment)

router.put("/updateAppointment/:id",updateAppointment)

router.delete("/cancelAppointment/:id",cancelAppointment)

export default router;