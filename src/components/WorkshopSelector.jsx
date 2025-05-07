import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert } from "react-bootstrap";
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
            <th>نام کارگاه</th>
            <th>نام مدیر</th>
            <th>حوزه فعالیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {workshops.length > 0 ? (
            workshops.map((workshop) => (
              <tr key={workshop.id}>
                <td>{workshop.workshop_name}</td>
                <td>{workshop.ceo_name}</td>
                <td>{workshop.field_of_work}</td>
                <td>
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
              <td colSpan="4" className="text-center">
                کارگاهی یافت نشد
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default WorkshopSelector;