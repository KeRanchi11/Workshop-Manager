import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container, Card, Table, Button, Form, Row, Col, Alert, InputGroup
} from "react-bootstrap";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaSignOutAlt } from "react-icons/fa";

// استایل سفارشی برای تغییرات درخواستی
const customStyles = `
.schedule-input-group {
  justify-content: center !important;
}
.schedule-input-group .form-control {
  border-radius: 12px 0 0 12px !important;
}
.schedule-input-group .btn {
  border-radius: 0 12px 12px 0 !important;
  margin-right: 8px;
  margin-left: 0;
  min-width: 90px;
}
.schedule-date-header {
  font-size: 13px !important;
  font-weight: normal !important;
}
.schedule-panel-table {
  border-radius: 20px !important;
  overflow: hidden;
}
.schedule-panel-table th:first-child {
  border-top-right-radius: 16px !important;
}
.schedule-panel-table th:last-child {
  border-top-left-radius: 16px !important;
}
.schedule-panel-table tr:last-child td:first-child {
  border-bottom-right-radius: 16px !important;
}
.schedule-panel-table tr:last-child td:last-child {
  border-bottom-left-radius: 16px !important;
}
`;

const getNext7Days = () => {
  const days = [];
  const today = new Date().toISOString().slice(0, 10); // تاریخ امروز
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: d.toLocaleDateString("fa-IR", { month: 'long', day: 'numeric', weekday: 'short' }),
      value: d.toISOString().slice(0, 10),
      isToday: d.toISOString().slice(0, 10) === today, // بررسی آیا روز جاری است
    });
  }
  return days;
};


const SchedulePanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workshopId = location.state?.workshopId ?? null;

  // State
  const [materials, setMaterials] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [newMaterial, setNewMaterial] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const days = getNext7Days();

  useEffect(() => {
    if (!workshopId) {
      setMessage("کارگاه یافت نشد.");
      setLoading(false);
      return;
    }
    axios
      .get(`http://localhost/workshop-manager/src/backend/SchedulePanel.php?workshop_id=${workshopId}`)
      .then((res) => {
        if (res.data.status === "success") {
          const materialsData = Object.keys(res.data.materials);
          setMaterials(materialsData);
          setQuantities(res.data.materials);
          setMessage('');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMessage("خطا در دریافت اطلاعات.");
      });
  }, [workshopId]);

  // افزودن ماده اولیه
  const handleAddMaterial = () => {
    const mat = newMaterial.trim();
    if (!mat || materials.includes(mat)) return;
    setMaterials([...materials, mat]);
    setQuantities({ ...quantities, [mat]: {} });
    setNewMaterial("");
  };

  // تغییر مقدار روز
  const handleQuantityChange = (material, day, value) => {
    let val = Number(value);
    if (isNaN(val) || val < 0) val = "";
    setQuantities((prev) => ({
      ...prev,
      [material]: {
        ...prev[material],
        [day]: val
      }
    }));
  };

  // ثبت اطلاعات
  const handleSubmit = async () => {
    setMessage("");
    try {
      await axios.post("http://localhost/workshop-manager/src/backend/SchedulePanel.php", {
        workshop_id: workshopId,
        data: quantities
      });
      setMessage("زمان‌بندی با موفقیت ثبت شد.");
      setEditMode(false);
    } catch {
      setMessage("ثبت با خطا مواجه شد.");
    }
  };

  // حذف یک ماده اولیه
  // حذف یک ماده اولیه
  const handleRemoveMaterial = async (mat) => {
    if (!window.confirm(`آیا از حذف ماده "${mat}" مطمئن هستید؟`)) return;

    try {
      await axios({
        method: 'DELETE',
        url: "http://localhost/workshop-manager/src/backend/SchedulePanel.php",
        data: {
          workshop_id: workshopId,
          material_name: mat,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      // حذف از رابط کاربری
      setMaterials(materials.filter((m) => m !== mat));
      const copy = { ...quantities };
      delete copy[mat];
      setQuantities(copy);
      setMessage(`ماده "${mat}" با موفقیت حذف شد.`);
    } catch (error) {
      console.error("خطا در حذف ماده:", error);
      setMessage("حذف ماده با خطا مواجه شد.");
    }
  };



  // خروج از پنل
  const handleExit = () => {
    navigate(-1);
  };

  // فعال سازی ویرایش
  const handleEdit = () => setEditMode(true);

  if (loading) return (
    <Container className="mt-5 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <div className="mt-2">در حال بارگذاری...</div>
    </Container>
  );
  if (!workshopId) return (
    <Container className="mt-5 text-center">
      <Alert variant="danger">کارگاه یافت نشد.</Alert>
    </Container>
  );

  return (
    <Container style={{ direction: "rtl", maxWidth: "950px" }} className="mt-4">
      {/* استایل سفارشی تزریق می‌شود */}
      <style>{customStyles}</style>
      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white d-flex align-items-center justify-content-between">
          <span style={{ fontWeight: 600 }}>جدول زمان‌بندی ارسال مواد اولیه</span>
          <FaEdit />
        </Card.Header>
        <Card.Body>
          {/* افزودن ماده اولیه */}
          {editMode && (
            <Row className="mb-3">
              <Col xs={12}>
                <InputGroup className="schedule-input-group d-flex">
                  <Form.Control
                    type="text"
                    value={newMaterial}
                    onChange={e => setNewMaterial(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleAddMaterial();
                    }}
                    placeholder="نام ماده اولیه جدید ..."
                  />
                  <Button
                    variant="success"
                    onClick={handleAddMaterial}
                    disabled={!newMaterial.trim() || materials.includes(newMaterial.trim())}
                  >
                    <FaPlus /> افزودن
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          )}

          {/* جدول */}
          <div className="table-responsive schedule-panel-table">
            <Table bordered hover size="sm" className="align-middle text-center mb-0">
              <thead className="table-primary">
                <tr>
                  <th>نام ماده اولیه</th>
                  {days.map((d) => (
                    <th key={d.value} className="schedule-date-header">{d.label}</th>
                  ))}
                  {editMode && <th>حذف</th>}
                </tr>
              </thead>
              <tbody>
                {!materials.length && (
                  <tr>
                    <td colSpan={days.length + (editMode ? 2 : 1)}>
                      ماده اولیه‌ای ثبت نشده است.
                    </td>
                  </tr>
                )}
                {materials.map(mat => (
                  <tr key={mat} style={{ verticalAlign: "middle" }}>
                    <td style={{ fontWeight: "bold", background: "#f8f9fa" }}>{mat}</td>
                    {days.map(d => (
                      <td key={d.value}>
                        {editMode ? (
                          <Form.Control
                            type="number"
                            min="0"
                            style={{
                              width: "70px", margin: "0 auto",
                              textAlign: "center", borderColor: "#80bdff"
                            }}
                            value={quantities[mat]?.[d.value] ?? ""}
                            onChange={e => handleQuantityChange(mat, d.value, e.target.value)}
                            readOnly={d.isToday} // اگر روز جاری است، فیلد غیر قابل ویرایش باشد
                          />
                        ) : (
                          quantities[mat]?.[d.value] || "-"
                        )}
                      </td>
                    ))}

                    {editMode && (
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveMaterial(mat)}
                          title="حذف ماده"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* دکمه‌ها */}
          <div className="d-flex gap-3 mt-4">
            {editMode ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="fw-bold px-4"
              >
                <FaCheck /> ثبت
              </Button>
            ) : (
              <Button
                variant="warning"
                onClick={handleEdit}
                className="fw-bold px-4 text-white"
              >
                <FaEdit /> ویرایش
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleExit}
              className="fw-bold px-4"
            >
              <FaSignOutAlt /> خروج
            </Button>
          </div>
          {/* پیام */}
          {!!message && (
            <Alert
              className="mt-4"
              variant={message.includes("خطا") ? "danger" : "success"}
              style={{ maxWidth: "400px" }}
            >
              {message}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SchedulePanel;
