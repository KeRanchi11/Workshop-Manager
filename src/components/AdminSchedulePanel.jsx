import React, { useEffect, useState } from "react";
import { Table, Card, Spinner, Badge, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const AdminSchedulePanel = () => {
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date()); // شروع هفته جاری
  const navigate = useNavigate();

  // تابع دریافت داده‌ها از بک‌اند
  const fetchSchedulesForWeek = (weekStart) => {
    setLoading(true);
    const formattedStart = weekStart.toISOString().slice(0, 10); // تبدیل تاریخ شروع هفته به فرمت مناسب
    fetch(`http://localhost/workshop-manager/src/backend/getScheduleData.php?weekStart=${formattedStart}`)
      .then((res) => res.json())
      .then((data) => {
        setDates(data.dates);
        setWorkshops(data.workshops);
        setSchedules(data.schedules);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error:", err);
      });
  };

  // بارگذاری داده‌ها برای هفته جاری هنگام بارگذاری کامپوننت
  useEffect(() => {
    fetchSchedulesForWeek(currentWeekStart);
  }, [currentWeekStart]);

  // محاسبه تاریخ‌های هفته جاری
  const getWeekDates = (start) => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDates.push(date.toISOString().slice(0, 10));
    }
    return weekDates;
  };

  // حرکت به هفته بعد
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // حرکت به هفته قبلی (محدود به هفته جاری)
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    if (newStart <= new Date()) {
      // جلوگیری از حرکت به قبل از هفته جاری
      setCurrentWeekStart(new Date());
    } else {
      setCurrentWeekStart(newStart);
    }
  };

  const transformData = () => {
    if (!selectedDate) {
      return workshops.map((workshop) => {
        const row = { "نام کارگاه": workshop.workshop_name };
        getWeekDates(currentWeekStart).forEach((date) => {
          const items = schedules[workshop.id]?.[date] ?? [];
          row[date] = items.length
            ? items.map((item) => `${item.material_name}: ${item.quantity}`).join(", ")
            : "—";
        });
        return row;
      });
    } else {
      return workshops.map((workshop) => {
        const row = { "نام کارگاه": workshop.workshop_name };
        const items = schedules[workshop.id]?.[selectedDate] ?? [];
        row[selectedDate] = items.length
          ? items.map((item) => `${item.material_name}: ${item.quantity}`).join(", ")
          : "—";
        return row;
      });
    }
  };

  const exportToExcel = () => {
    const data = transformData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, selectedDate ? `WorkshopSchedule-${selectedDate}.xlsx` : "WorkshopSchedule.xlsx");
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p style={{ marginTop: 10 }}>در حال بارگذاری برنامه‌ها...</p>
      </div>
    );

  const transposedData = transformData();

  const tableTitle = selectedDate
    ? `مواد اولیه مورد نیاز کارگاه‌ها در تاریخ  ${new Date(selectedDate).toLocaleDateString("fa-IR-u-nu-latn", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}`
    : `برنامه هفتگی مواد اولیه کارگاه‌ها از تاریخ ${new Date(currentWeekStart).toLocaleDateString(
        "fa-IR-u-nu-latn",
        { month: "long", day: "numeric" }
      )}`;

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="info" size="sm" onClick={() => navigate("/admin")} className="me-2">
          بازگشت به پنل مدیریت
        </Button>
        <div>
          {selectedDate && (
            <Button
              variant="secondary"
              size="sm"
              className="me-2"
              onClick={() => setSelectedDate(null)}
            >
              بازگشت به جدول هفتگی
            </Button>
          )}
          <Button variant="success" size="sm" onClick={exportToExcel}>
            خروجی اکسل
          </Button>
        </div>
      </div>
      {/* دکمه‌های حرکت بین هفته‌ها */}
      <div className="d-flex justify-content-between mb-4">
        <Button variant="primary" size="sm" onClick={goToPreviousWeek}>
          هفته قبلی
        </Button>
        <Button variant="primary" size="sm" onClick={goToNextWeek}>
          هفته بعدی
        </Button>
      </div>
      <Card className="shadow rounded-3" style={{ border: "none" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-end" style={{ fontWeight: 700, fontSize: "1.3rem" }}>
            {tableTitle}
          </Card.Title>
          <div className="table-responsive">
            <Table bordered hover className="align-middle mb-0" style={{ background: "#fbfcff" }}>
              <thead className="bg-info text-white">
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>نام کارگاه</th>
                  {selectedDate
                    ? (
                        <th
                          style={{
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {new Date(selectedDate).toLocaleDateString("fa-IR-u-nu-latn", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </th>
                      )
                    : getWeekDates(currentWeekStart).map((date) => (
                        <th
                          key={date}
                          style={{ whiteSpace: "nowrap", textAlign: "center", cursor: "pointer" }}
                          onClick={() => setSelectedDate(date)}
                          title="مشاهده فقط این تاریخ"
                        >
                          {new Date(date).toLocaleDateString("fa-IR-u-nu-latn", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {workshops.map((workshop) => (
                  <tr key={workshop.id}>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{workshop.workshop_name}</td>
                    {(selectedDate ? [selectedDate] : getWeekDates(currentWeekStart)).map((date) => {
                      const items = schedules[workshop.id]?.[date] ?? [];
                      return (
                        <td
                          key={`${workshop.id}-${date}`}
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                            padding: "9px 2px",
                          }}
                        >
                          {items.length ? (
                            items.map((item, idx) => (
                              <div key={idx} style={{ margin: "0 0 5px 0" }}>
                                <Badge bg="secondary" className="me-1">
                                  {item.material_name}
                                </Badge>
                                <span style={{ fontWeight: 600, color: "#146c43" }}>{item.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <span style={{ color: "#cad5dd", fontSize: "1.4rem", opacity: "0.7" }}>
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminSchedulePanel;
