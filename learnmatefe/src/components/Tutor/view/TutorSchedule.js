import React, { useEffect, useState } from "react";
import { getTutorSchedule } from "../ApiTutor";
import dayjs from "dayjs";
import 'dayjs/locale/vi';
import './TutorSchedule.scss';

const TutorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs().startOf('week').add(1, 'day')); // Thứ 2
  const [selectedWeekDate, setSelectedWeekDate] = useState(dayjs());

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    const res = await getTutorSchedule();
    if (res.errorCode === 0) {
      setSchedules(res.data);
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  const getWeekDates = () => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(currentWeekStart.add(i, 'day'));
    }
    return dates;
  };

  const changeWeek = (direction) => {
    setCurrentWeekStart(prev => prev.add(direction * 7, 'day'));
  };

  const handleWeekPick = (e) => {
    const date = dayjs(e.target.value);
    if (date.isValid()) {
      setSelectedWeekDate(date);
      setCurrentWeekStart(date.startOf('week').add(1, 'day')); // Thứ 2
    }
  };

  const getSchedulesForDay = (date) => {
    return schedules.filter(sch => dayjs(sch.date).isSame(date, 'day'));
  };

  return (
    <div className="tutor-schedule p-4">
      <h2 className="text-xl font-bold mb-4">Lịch dạy của tôi</h2>

      {/* Chọn tuần */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <button 
          onClick={() => changeWeek(-1)} 
          className="btn-week"
        >
          ⬅ Tuần trước
        </button>

        <input 
          type="date" 
          value={selectedWeekDate.format("YYYY-MM-DD")}
          onChange={handleWeekPick}
          className="input-week"
        />

        <span className="font-medium">
          {currentWeekStart.format("DD/MM/YYYY")} - {currentWeekStart.add(6, 'day').format("DD/MM/YYYY")}
        </span>

        <button 
          onClick={() => changeWeek(1)} 
          className="btn-week"
        >
          Tuần sau ➡
        </button>

        <button
          onClick={fetchSchedule}
          className="btn-refresh"
        >
          Tải lại
        </button>
      </div>

      {loading ? (
        <p>Đang tải lịch...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="schedule-table">
            <thead>
              <tr>
                {getWeekDates().map(date => (
                  <th key={date.format("DD/MM/YYYY")}>
                    {date.format("ddd DD/MM")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {getWeekDates().map(date => {
                  const daySchedules = getSchedulesForDay(date);
                  return (
                    <td key={date.format("DD/MM/YYYY")}>
                      {daySchedules.length === 0 ? (
                        <div className="no-schedule">Trống</div>
                      ) : (
                        daySchedules.map(sch => (
                          <div key={sch._id} className="schedule-card">
                            <div className="time">{sch.startTime} - {sch.endTime}</div>
                            <div className="subject">{sch.bookingId?.subjectId?.name || "-"}</div>
                            <div className="learner">
                                {sch.learnerId?.username + `(`+sch.learnerId?.email + `-`+ sch.learnerId?.phoneNumber + `)`}`
                            </div>
                            <div className="address">{sch.bookingId?.address || "-"}</div>
                            {/* <div className={`status ${sch.status}`}>{sch.status}</div> */}
                          </div>
                        ))
                      )}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TutorSchedule;
