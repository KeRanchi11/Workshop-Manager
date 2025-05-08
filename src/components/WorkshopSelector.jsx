import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const WorkshopSelector = () => {
  const [workshops, setWorkshops] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // دریافت لیست کارگاه‌ها از بک‌اند
    fetch("http://localhost/workshop-manager/src/backend/AdminGetWorkshops.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWorkshops(data.workshops);
        } else {
          setError(data.message || "خطا در دریافت کارگاه‌ها");
        }
      })
      .catch((err) => {
        setError("خطا در ارتباط با سرور: " + err.message);
      });
  }, []);

  const handleSelectWorkshop = (workshopId) => {
    // هدایت به صفحه ویرایش با ارسال workshop_id
    navigate(`/adminedit/${workshopId}`);
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4 text-center">انتخاب کارگاه برای ویرایش</h3>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      <Table bordered hover>
        <thead>
          <tr>
            <th className="text-center align-middle">نام کارگاه</th>
            <th className="text-center align-middle">نام مدیر</th>
            <th className="text-center align-middle">حوزه فعالیت</th>
            <th className="text-center align-middle">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {workshops.length > 0 ? (
            workshops.map((workshop) => (
              <tr key={workshop.id}>
                <td className="text-center align-middle">{workshop.workshop_name}</td>
                <td className="text-center align-middle">{workshop.ceo_name}</td>
                <td className="text-center align-middle">{workshop.field_of_work}</td>
                <td className="text-center align-middle">
                  <Button
                    variant="primary"
                    onClick={() => handleSelectWorkshop(workshop.id)}
                  >
                    انتخاب و ویرایش
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center align-middle">
                کارگاهی یافت نشد
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Row className="mt-3">
        <Col className="text-start">
          <Button variant="secondary" onClick={() => navigate('/admin')}>
            بازگشت
          </Button>
        </Col>
      </Row>

    </Container>

  );
};

export default WorkshopSelector;