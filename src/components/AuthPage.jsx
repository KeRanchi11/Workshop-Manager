import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card, Alert, FloatingLabel, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../style/AuthPage.css'

// استایل ها
const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)",
};

const glassCard = {
  background: "rgba(255, 255, 255, 0.8)",
  borderRadius: "1.5rem",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "2.5rem 2rem 2rem 2rem",
  maxWidth: "420px",
  margin: "auto",
};

const titleStyle = {
  fontFamily: "'Vazirmatn', sans-serif",
  fontWeight: 800,
  color: "#6246ea",
};

const btnStyle = {
  borderRadius: "999px",
  boxShadow: "0 4px 16px 0 #ada7f5cc",
  letterSpacing: "0.5px",
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin((prev) => !prev);

  return (
    <div style={pageStyle}>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Row className="w-100">
          <Col>
            <Card style={glassCard}>
              <Card.Body>
                <div className="text-center mb-4">
                  <h3 >{isLogin ? "ورود به حساب" : "ایجاد حساب کاربری"}</h3>
                </div>
                {isLogin ? <LoginForm /> : <RegisterForm />}
                <div
                  className="text-center mt-3"
                  style={{
                    fontFamily: "'KalamehWeb'",
                    fontSize: "1rem",
                    direction: "rtl",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2, // فاصله کم بین متن و لینک
                  }}
                >
                  <span>{isLogin ? "حساب ندارید؟" : "حساب دارید؟"}</span>
                  <Button
                    variant="link"
                    onClick={toggleForm}
                    className="custom-auth-link"
                    style={{
                      padding: 0,
                      margin: 0,
                      color: "#6246ea",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textDecoration: "none",
                      transition: "color 0.2s",
                      verticalAlign: "baseline",
                    }}
                  >
                    {isLogin ? "ثبت‌نام کنید" : "وارد شوید"}
                  </Button>
                </div>


              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// ----------------- Login Form ------------------
const LoginForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation logic
  const validate = (fieldValues) => {
    let temp = { ...errors };
    let val = fieldValues || values;
    if ("username" in val)
      temp.username = val.username.length >= 4 ? "" : "حداقل ۴ کاراکتر وارد نمایید.";
    if ("password" in val)
      temp.password = val.password.length >= 5 ? "" : "رمز حداقل باید ۵ کاراکتر باشد.";
    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate({ ...values, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(values);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate(values)) return;
    setLoading(true);
    try {
      const resp = await fetch("http://localhost/workshop-manager/src/backend/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await resp.json();
      if (data.status === "success") {
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate(`/user/${data.user_id}`);
        }
      } else {
        setServerError(data.message || "ورود ناموفق بود.");
      }
    } catch (error) {
      setServerError("ارتباط با سرور برقرار نشد.");
    }
    setLoading(false);
  };

  // 👇 فقط این خط جایگزین شد (به جای !validate())
  const isFormValid =
    values.username.length >= 4 &&
    values.password.length >= 5 &&
    Object.values(errors).every((x) => x === "");

  return (
    <>
      {serverError && <Alert variant="danger">{serverError}</Alert>}
      <Form noValidate onSubmit={handleLogin} autoComplete="off">
        <Form.Group>
          <FloatingLabel label="نام کاربری" className="mb-3">
            <Form.Control
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.username && !!errors.username}
              isValid={touched.username && !errors.username && values.username}
              placeholder="نام کاربری"
              required
            />
            <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Form.Group className="mb-2">
          <FloatingLabel label="رمز عبور" className="mb-3">
            <Form.Control
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.password && !!errors.password}
              isValid={touched.password && !errors.password && values.password}
              placeholder="رمز عبور"
              required
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Button
          className="mt-2 w-100"
          type="submit"
          variant="primary"
          size="lg"
          style={btnStyle}
          disabled={loading || !isFormValid}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "ورود"}
        </Button>
      </Form>
    </>
  );
};

// ----------------- Register Form ------------------
const RegisterForm = () => {
  const [values, setValues] = useState({
    username: "",
    password: "",
    phone: "",
    role: "user",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // موبایل ایرانی
  const isValidPhone = (number) => /^09\d{9}$/.test(number);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Complexity checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    // Cap at 5 for our progress calculation
    return Math.min(strength, 5);
  };

  const strengthColors = {
    0: '#ff4d4f', // Very weak (red)
    1: '#ff7d4f', // Weak (orange)
    2: '#ffa940', // Fair (yellow-orange)
    3: '#ffc53d', // Moderate (yellow)
    4: '#73d13d', // Strong (green)
    5: '#389e0d', // Very strong (dark green)
  };

  const progressStyle = {
    height: '6px',
    borderRadius: '3px',
    marginTop: '4px',
    transition: 'all 0.3s ease',
  };

  // Validation logic
  const validate = (fieldValues) => {
    let temp = { ...errors };
    let val = fieldValues || values;
    if ("username" in val) {
      const usernameRegex = /^[a-zA-Z0-9]+$/; // فقط حروف انگلیسی و اعداد
      temp.username = usernameRegex.test(val.username)
        ? val.username.length >= 4
          ? ""
          : "نام کاربری حداقل باید ۴ کاراکتر داشته باشد."
        : "نام کاربری فقط شامل حروف انگلیسی و اعداد باشد.";
    }

    if ("password" in val) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      temp.password = passwordRegex.test(val.password)
        ? ""
        : "رمز عبور باید حداقل ۸ کاراکتر و شامل حروف کوچک، حروف بزرگ و اعداد باشد.";
    }

    if ("phone" in val)
      temp.phone =
        val.phone === ""
          ? "وارد کردن شماره ضروری است."
          : isValidPhone(val.phone)
            ? ""
            : "فرمت شماره موبایل اشتباه است (مانند 09121234567)";
    if ("role" in val)
      temp.role =
        val.role === "user" || val.role === "admin"
          ? ""
          : "نقش صحیح انتخاب کنید.";
    setErrors(temp);
    return Object.values(temp).every((x) => x === "");
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate({ ...values, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(values);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setServerError("");
    setSuccess("");
    if (!validate(values)) return;
    setLoading(true);
    try {
      const resp = await fetch("http://localhost/workshop-manager/src/backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await resp.json();
      if (data.status === "success") {
        setSuccess("ثبت‌نام موفقیت‌آمیز بود! اکنون می‌توانید وارد شوید.");
        setValues({ username: "", password: "", phone: "", role: "user" });
        setTouched({});
      } else {
        setServerError(data.message || "ثبت‌نام ناموفق بود.");
      }
    } catch (error) {
      setServerError("ارتباط با سرور برقرار نشد.");
    }
    setLoading(false);
  };

  // 👇 این خط را بجای !validate() قرار بده
  const isFormValid =
    values.username.length >= 4 &&
    values.password.length >= 6 &&
    isValidPhone(values.phone) &&
    (values.role === "user" || values.role === "admin") &&
    Object.values(errors).every((x) => x === "");

  return (
    <>
      {serverError && <Alert variant="danger">{serverError}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form noValidate onSubmit={handleRegister} autoComplete="off">
        <Form.Group>
          <FloatingLabel label="نام کاربری" className="mb-3">
            <Form.Control
              type="text"
              name="username"
              placeholder="نام کاربری"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.username && !!errors.username}
              isValid={touched.username && !errors.username && values.username}
              required
            />
            <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Form.Group>
          <FloatingLabel label="رمز عبور" className="mb-3">
            <Form.Control
              type="password"
              name="password"
              placeholder="رمز عبور"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.password && !!errors.password}
              isValid={touched.password && !errors.password && values.password}
              required
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            {values.password && (
              <>
                <div style={{
                  ...progressStyle,
                  width: `${(calculatePasswordStrength(values.password) / 5) * 100}%`,
                  backgroundColor: strengthColors[calculatePasswordStrength(values.password)]
                }} />
                <div style={{
                  fontSize: '0.75rem',
                  color: strengthColors[calculatePasswordStrength(values.password)],
                  textAlign: 'right',
                  marginTop: '2px'
                }}>
                  {['خیلی ضعیف', 'ضعیف', 'متوسط', 'قوی', 'خیلی قوی'][calculatePasswordStrength(values.password)]}
                </div>
              </>
            )}
          </FloatingLabel>
        </Form.Group>
        <Form.Group>
          <FloatingLabel label="شماره تلفن همراه" className="mb-3">
            <Form.Control
              type="text"
              name="phone"
              placeholder="مانند 09123456789"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.phone && !!errors.phone}
              isValid={touched.phone && !errors.phone && values.phone}
              required
              inputMode="numeric"
              maxLength={11}
            />
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Form.Group className="mb-3">
          <FloatingLabel label="نقش کاربری">
            <Form.Select
              name="role"
              value={values.role}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.role && !!errors.role}
              isValid={touched.role && !errors.role && values.role}
              required
            >
              <option value="user">کاربر عادی</option>
              {/* <option value="admin disabled">ادمین</option> */}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
        <Button
          className="mt-2 w-100"
          type="submit"
          variant="success"
          size="lg"
          style={btnStyle}
          disabled={loading || !isFormValid}
        >
          {loading ? <Spinner animation="border" size="sm" /> : "ثبت‌نام"}
        </Button>
      </Form>
    </>
  );
};

export default AuthPage;
