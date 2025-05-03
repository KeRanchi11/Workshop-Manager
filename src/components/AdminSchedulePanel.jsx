import React, { useEffect, useState } from "react";
import { Table, Card, Spinner, Badge, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const AdminSchedulePanel = () => {
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(null); // اضافه شد
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/workshop-manager/src/backend/getScheduleData.php")
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
  }, []);

  // داده‌ها: جدول کامل یا فقط یک تاریخ
  const transformData = () => {
    if (!selectedDate) {
      return workshops.map((workshop) => {
        const row = { "نام کارگاه": workshop.workshop_name };
        dates.forEach((date) => {
          const items = schedules[workshop.id]?.[date] ?? [];
          row[date] = items.length
            ? items.map((item) => `${item.material_name}: ${item.quantity}`).join(", ")
            : "—";
        });
        return row;
      });
    } else {
      // فقط اطلاعات یک تاریخ خاص
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

  // خروجی اکسل: جدول کامل یا فقط همان تاریخ  
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

  // عنوان جدول دینامیک بر اساس صفحه یا تاریخ انتخابی
  const tableTitle = selectedDate
    ? `مواد اولیه مورد نیاز کارگاه‌ها در تاریخ  ${new Date(selectedDate).toLocaleDateString("fa-IR-u-nu-latn", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}`
    : "برنامه هفتگی مواد اولیه کارگاه‌ها";

  return (
    <Container className="mt-4 mb-5">
      {/* دکمه‌ها */}
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

      {/* کارت جدول */}
      <Card className="shadow rounded-3" style={{ border: "none" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-end" style={{ fontWeight: 700, fontSize: "1.3rem" }}>
            {tableTitle}
          </Card.Title>
          {/* جدول */}
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
                    : dates.map((date) => (
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
                    {(selectedDate ? [selectedDate] : dates).map((date) => {
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
      {/* استایل‌ها */}
      <style>{`
        .table th, .table td {
          vertical-align: middle !important;
          text-align: center;
        }
        .table th {
          background: #40bfff !important;
          color: white !important;
        }
        .table th[title] {
          cursor: pointer;
          transition: background 0.2s;
        }
        .table th[title]:hover {
          background: #0ea2fd !important;
        }
        .container-card {
          width: 100%;
        }
        .card-title {
          text-align: right !important;
        }
      `}</style>
    </Container>
  );
};

export default AdminSchedulePanel;
