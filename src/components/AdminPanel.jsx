import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Spinner, Container, Row, Col, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // برای مدیریت مسیرها (Route Navigation)

const cardStyles = {
  border: "none",
  borderRadius: "18px",
  boxShadow: "0 4px 24px 0 rgba(60, 72, 88, 0.15)",
  transition: "transform 0.2s",
  cursor: "pointer",
};

const avatarStyles = {
  background: "linear-gradient(135deg,#00c9ff 0,#92fe9d 100%)",
  color: "#fff",
  borderRadius: "50%",
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "1.5rem",
  marginBottom: "8px",
  alignSelf: "center",
  boxShadow: "0 2px 8px rgba(44, 198, 242, 0.15)",
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // برای هدایت (redirect)

  useEffect(() => {
    fetch("http://localhost/workshop-manager/src/backend/getUserData.php") // مسیر را مطابق با سرور خودت ست کن!
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkshop(null);
  };

  const handleLogout = () => {
    navigate("/"); // هدایت به صفحه AuthPage.jsx (فرض می‌کنیم مسیر `/auth` باشد)
  };

  const handleSchedulePage = () => {
    navigate("/adminschedule"); // فرض می‌کنیم مسیر AdminSchedulePanel.jsx `/schedule` است
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="info" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center mt-5">
        <h3>هیچ کاربری ثبت نشده است.</h3>
      </div>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      {/* دکمه خروج و جابه‌جایی به برنامه کارگاه‌ها */}
      <div className="buttons-group text-end mb-3">
        <Button variant="danger" size="sm" onClick={handleLogout} className="me-2">
          خروج
        </Button>
        <Button variant="primary" size="sm" onClick={handleSchedulePage}>
          مشاهده برنامه هفتگی
        </Button>
      </div>

      <h2 className="text-center mb-4" style={{ fontWeight: 700 }}>پنل مدیریت کاربران و کارگاه‌ها</h2>
      <Row className="g-4">
        {users.map((user, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3}>
            <Card
              style={cardStyles}
              className="h-100 user-card hover-shadow"
              onClick={() => handleCardClick(user)}
            >
              <Card.Body className="d-flex flex-column align-items-center">
                <div style={avatarStyles}>{user.username.charAt(0).toUpperCase()}</div>
                <Card.Title style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                  {user.username}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: "0.95rem" }}>
                  <Badge bg="info" style={{ fontWeight: 500 }}>کاربر عادی</Badge>
                </Card.Subtitle>
                <Card.Text style={{ fontSize: "1rem" }}> شماره تماس : <span dir="ltr" style={{ fontWeight: 600 }}>{user.phone_number}</span> </Card.Text>
                <Button variant="outline-info" size="sm" className="mt-auto">
                  مشاهده جزییات کارگاه
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* مودال برای نمایش اطلاعات جزئی کارگاه */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        dialogClassName="modern-modal"
      >
<Modal.Header
  className="bg-info text-white d-flex flex-row-reverse align-items-center justify-content-between"
  style={{ direction: "rtl" }}
>
  <Button
    variant="link"
    onClick={handleCloseModal}
    style={{
      color: "white",
      fontSize: "1.5rem",
      textDecoration: "none",
      marginLeft: 8,
      marginRight: 0,
      padding: 0,
      border: "none",
      boxShadow: "none"
    }}
    aria-label="بستن"
  >
    ×
  </Button>
  <Modal.Title style={{ fontWeight: 600, fontSize: "1.2rem" }}>
    اطلاعات کارگاه:{" "}
    {selectedWorkshop && selectedWorkshop.workshop_id ? selectedWorkshop.workshop_name : ""}
  </Modal.Title>
</Modal.Header>

        <Modal.Body dir="rtl">
          {selectedWorkshop && selectedWorkshop.workshop_id ? (
            <div className="modal-info-rtl">
              <div className="modal-row">
                <span className="label">نام کارگاه:</span>
                <span className="value">{selectedWorkshop.workshop_name}</span>
              </div>
              <hr />
              <div className="modal-row">
                <span className="label">مدیر عامل:</span>
                <span className="value">{selectedWorkshop.ceo_name}</span>
              </div>
              <hr />
              <div className="modal-row">
                <span className="label">تعداد کارمندان:</span>
                <span className="value">{selectedWorkshop.staff_count}</span>
              </div>
              <hr />
              <div className="modal-row">
                <span className="label">ظرفیت:</span>
                <span className="value">{selectedWorkshop.capacity}</span>
              </div>
              <hr />
              <div className="modal-row">
                <span className="label">آدرس:</span>
                <span className="value">{selectedWorkshop.address}</span>
              </div>
              <hr />
              <div className="modal-row">
                <span className="label">حوزه کاری:</span>
                <span className="value">{selectedWorkshop.field_of_work}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted">
              کارگاهی برای این کاربر ثبت نشده است.
              <div style={{ fontSize: "2rem", marginTop: "6px" }}>😕</div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="info" onClick={handleCloseModal}>
            بستن
          </Button>
        </Modal.Footer>
      </Modal>

      {/* افکت هاور (CSS-in-JS یا تو index.css بذار): */}
      <style>{`
        .user-card:hover {
          transform: translateY(-8px) scale(1.035);
          box-shadow: 0 8px 32px 0 rgba(44, 198, 242, 0.25);
        }
        .modern-modal .modal-content {
          border-radius: 16px;
          border: none;
        }
        .modern-modal .modal-header {
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        .modern-modal .modal-footer {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        .buttons-group {
          position: sticky;
          z-index: 10;
          top: 0;
        }
      `}</style>
    </Container>
  );
};

export default AdminPanel;
