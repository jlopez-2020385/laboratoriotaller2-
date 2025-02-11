import Pet from "../pet/pet.model.js";
import Appointment from "../appointment/appointment.model.js";
import { parse } from "date-fns";

export const saveAppointment = async (req, res) => {
  try {
    const data = req.body;

    const isoDate = new Date(data.date);

    if (isNaN(isoDate.getTime())) {
      return res.status(400).json({
        success: false,
        msg: "Fecha inválida",
      });
    }

    const pet = await Pet.findOne({ _id: data.pet });
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        msg: "No se encontró la mascota" 
      });
    }

    const existAppointment = await Appointment.findOne({
      pet: data.pet,
      user: data.user,
      date: {
        $gte: new Date(isoDate).setHours(0, 0, 0, 0),
        $lt: new Date(isoDate).setHours(23, 59, 59, 999),
      },
    });

    if (existAppointment) {
      return res.status(400).json({
        success: false,
        msg: "El usuario y la mascota ya tienen una cita para este día",
      });
    }

    const appointment = new Appointment({ ...data, date: isoDate });
    await appointment.save();

    return res.status(200).json({
      success: true,
      msg: `Cita creada exitosamente en fecha ${data.date}`,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false, 
      msg: "Error al crear la cita", 
      error 
    }); 
  }
};


export const listappointment = async (req, res)=> {
  try{
    const { limite = 5 , desde = 0 } = req.query
    const query =  {status: "CREATED"}
    const [total, appointment] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.find(query).skip(Number(desde)).limit(Number(limite))
  ])

    return res.status(200).json({
      success: true,
      total,
      appointment
    })

  }catch(err){

    return res.status(500).json({
      success: false,
      message: "Error de lista datos no encontrados ",
      error: err.message
    })

  }

}



export const updateAppointment = async (req, res) => {
  try {

    const { id } = req.params;
    const data = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, data, { new: true });

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        msg: "Cita no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Cita actualizada exitosamente",
      appointment: updatedAppointment,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      msg: "Error al actualizar la cita",
      error: err.message,
    });
  }
};


export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        msg: "Cita no encontrada",
      });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    return res.status(200).json({
      success: true,
      msg: "Cita cancelada exitosamente",
      appointment,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error al cancelar la cita",
      error: err.message,
    });
  }
};

