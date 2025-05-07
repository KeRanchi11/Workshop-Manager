import React, { useState, useEffect } from "react";
import { Form, Button, Table, Container, Alert, Spinner } from "react-bootstrap";
import DatePicker from "react-multi-date-picker";
import Icon from "react-multi-date-picker/components/icon";
import "react-multi-date-picker/styles/colors/purple.css";
import "react-multi-date-picker/styles/layouts/mobile.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";
import { useParams } from "react-router-dom";

const AdminEditPanel = () => {
  const { workshopId } = useParams();
  const [phases, setPhases] = useState([
    { phase: "F1", material: "", selectedDates: [], quantities: {}, gregorianDates: {} },
    { phase: "F2", material: "", selectedDates: [], quantities: {}, gregorianDates: {} },
    { phase: "F3", material: "", selectedDates: [], quantities: {}, gregorianDates: {} },
    { phase: "F4", material: "", selectedDates: [], quantities: {}, gregorianDates: {} },
    { phase: "F5", material: "", selectedDates: [], quantities: {}, gregorianDates: {} },
    { phase: "F6", material: "", selectedDates: [], quantities: {}, gregorianDates: {} },
  ]);
  const [allSelectedDates, setAllSelectedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // تبدیل ارقام فارسی به لاتین
  const persianToEnglishDigits = (str) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = str;
    for (let i = 0; i < persianDigits.length; i++) {
      result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
    }
    return result;
  };

  // تبدیل تاریخ شمسی به میلادی
  const convertPersianToGregorian = (date) => {
    if (!date || !date.isValid) return null;
    const persianDate = persianToEnglishDigits(date.format("YYYY-MM-DD"));
    const gregorianDate = moment(persianDate, 'jYYYY-jMM-jDD').format('YYYY-MM-DD');
    console.log(`Converting Persian to Gregorian: ${persianDate} -> ${gregorianDate}`);
    return gregorianDate;
  };

  // تبدیل تاریخ میلادی به شمسی برای نمایش
  const convertGregorianToPersian = (gregorianDate) => {
    if (!gregorianDate) return '';
    try {
      const persianDate = moment(gregorianDate, 'YYYY-MM-DD').format('jYYYY-jMM-jDD');
      const convertedDate = persianToEnglishDigits(persianDate);
      console.log(`Converting Gregorian to Persian: ${gregorianDate} -> ${convertedDate}`);
      return convertedDate;
    } catch (err) {
      console.error("Error converting Gregorian to Persian:", err);
      return '';
    }
  };

  // لود اطلاعات از دیتابیس
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost/workshop-manager/src/backend/GetScheduleByWorkshop.php?workshop_id=${workshopId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched schedules:", data);
        if (data.success && data.schedules && data.schedules.length > 0) {
          const updatedPhases = phases.map((phase, index) => {
            const schedule = data.schedules[index] || { material_name: "", selected_dates: [], quantities: {} };
            console.log(`Processing schedule for phase ${phase.phase}:`, schedule);
            
            // بررسی و تبدیل تاریخ‌ها
            const selectedDates = schedule.selected_dates || [];
            const convertedDates = selectedDates
              .filter(date => date) // حذف تاریخ‌های نامعتبر
              .map((date) => ({
                persian: convertGregorianToPersian(date),
                gregorian: date,
              }));
            
            const convertedQuantities = {};
            const gregorianDates = {};
            convertedDates.forEach(({ persian, gregorian }) => {
              if (persian) { // فقط اگر تاریخ شمسی معتبر باشد
                convertedQuantities[persian] = schedule.quantities?.[gregorian] || 0;
                gregorianDates[persian] = gregorian;
              }
            });

            return {
              ...phase,
              material: schedule.material_name || "",
              selectedDates: convertedDates.map((d) => d.persian).filter(date => date), // فقط تاریخ‌های معتبر
              quantities: convertedQuantities,
              gregorianDates,
            };
          });
          console.log("Updated phases after fetch:", updatedPhases);
          setPhases(updatedPhases);
          setAllSelectedDates(updatedPhases.flatMap((p) => p.selectedDates));
        } else {
          console.log("No schedules found, resetting phases");
          setPhases(phases);
          setAllSelectedDates([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
        setError(true);
        setLoading(false);
      });
  }, [workshopId]);

  const handleDateSelection = (phase, date) => {
    if (!date || !date.isValid) return;
    const persianDate = persianToEnglishDigits(date.format("YYYY-MM-DD")); // تاریخ شمسی برای UI
    const gregorianDate = convertPersianToGregorian(date); // تاریخ میلادی برای بک‌اند
    if (allSelectedDates.includes(persianDate)) {
      alert("این تاریخ قبلاً در فاز دیگری انتخاب شده است!");
      return;
    }

    const updatedPhases = phases.map((p) =>
      p.phase === phase
        ? {
            ...p,
            selectedDates: [...p.selectedDates, persianDate],
            quantities: { ...p.quantities, [persianDate]: 0 },
            gregorianDates: { ...p.gregorianDates, [persianDate]: gregorianDate },
          }
        : p
    );
    setPhases(updatedPhases);
    setAllSelectedDates([...allSelectedDates, persianDate]);
  };

  const handleQuantityChange = (phase, date, quantity) => {
    const updatedPhases = phases.map((p) =>
      p.phase === phase
        ? {
            ...p,
            quantities: { ...p.quantities, [date]: quantity },
          }
        : p
    );
    setPhases(updatedPhases);
  };

  const handleSave = () => {
    const validPhases = phases.filter(
      (phase) => phase.material.trim() && phase.selectedDates.length > 0
    );
    if (validPhases.length === 0) {
      alert("لطفاً حداقل برای یک فاز ماده اولیه و تاریخ انتخاب کنید.");
      return;
    }

    // آماده‌سازی داده‌ها برای ارسال (استفاده از تاریخ‌های میلادی)
    const phasesForBackend = phases.map((phase) => ({
      ...phase,
      selectedDates: phase.selectedDates.map((persianDate) => phase.gregorianDates[persianDate]),
      quantities: Object.fromEntries(
        Object.entries(phase.quantities).map(([persianDate, quantity]) => [
          phase.gregorianDates[persianDate],
          quantity,
        ])
      ),
    }));

    console.log("Data to be sent:", { workshop_id: workshopId, phases: phasesForBackend });

    setSaving(true);
    fetch("http://localhost/workshop-manager/src/backend/AdminEditPanel.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshop_id: workshopId, phases: phasesForBackend }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Server response:", data);
        if (data.success) {
          setSuccess(true);
          setError(false);
          if (data.schedules) {
            const updatedPhases = phases.map((phase, index) => {
              const schedule = data.schedules[index] || phase;
              const persianDate = schedule.delivery_day ? convertGregorianToPersian(schedule.delivery_day) : null;
              return {
                ...phase,
                material: schedule.material_name || phase.material,
                selectedDates: persianDate ? [...phase.selectedDates, persianDate] : phase.selectedDates,
                quantities: schedule.quantity
                  ? { ...phase.quantities, [persianDate]: schedule.quantity }
                  : phase.quantities,
                gregorianDates: persianDate
                  ? { ...phase.gregorianDates, [persianDate]: schedule.delivery_day }
                  : phase.gregorianDates,
              };
            });
            setPhases(updatedPhases);
            setAllSelectedDates([...allSelectedDates, ...data.schedules.map((s) => convertGregorianToPersian(s.delivery_day))]);
          }
        } else {
          setError(true);
          console.error("Server error:", data.message, data.debug);
        }
        setSaving(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(true);
        setSaving(false);
      });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p style={{ marginTop: 10 }}>در حال بارگذاری...</p>
      </div>
    );

  return (
    <Container className="mt-5">
      <h3 className="mb-4 text-center">مدیریت مواد اولیه کارگاه‌ها</h3>
      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          اطلاعات با موفقیت ذخیره شد.
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={() => setError(false)} dismissible>
          خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.
        </Alert>
      )}
      <Table bordered>
        <thead>
          <tr>
            <th>فاز</th>
            <th>ماده اولیه</th>
            <th>انتخاب تاریخ‌ها</th>
            <th>تاریخ‌های انتخاب‌شده و مقدار مواد اولیه</th>
          </tr>
        </thead>
        <tbody>
          {phases.map((phase) => (
            <tr key={phase.phase}>
              <td>{phase.phase}</td>
              <td>
                <Form.Control
                  type="text"
                  value={phase.material}
                  placeholder="نام ماده اولیه"
                  onChange={(e) =>
                    setPhases(
                      phases.map((p) =>
                        p.phase === phase.phase ? { ...p, material: e.target.value } : p
                      )
                    )
                  }
                />
              </td>
              <td>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  render={<Icon />}
                  inputClass="form-control"
                  placeholder="انتخاب تاریخ شمسی"
                  editable={false}
                  onOpenPickNewDate={false}
                  minDate={new Date(Date.now() + 86400000)}
                  onChange={(date) => {
                    if (date && date.isValid) {
                      handleDateSelection(phase.phase, date);
                    }
                  }}
                  style={{ width: "100%" }}
                />
              </td>
              <td>
                {phase.selectedDates.length > 0 ? (
                  phase.selectedDates.map((date) => (
                    <div key={date} className="mb-2">
                      <strong>{date}:</strong>
                      <Form.Control
                        type="number"
                        min="0"
                        value={phase.quantities[date] || 0}
                        onChange={(e) =>
                          handleQuantityChange(phase.phase, date, e.target.value)
                        }
                        style={{
                          display: "inline-block",
                          width: "120px",
                          marginLeft: "8px",
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <span style={{ color: "gray" }}>تاریخی انتخاب نشده</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button
        variant="success"
        onClick={handleSave}
        disabled={saving}
        className="mt-3"
      >
        {saving ? <Spinner animation="border" size="sm" /> : "ثبت اطلاعات"}
      </Button>
    </Container>
  );
};

export default AdminEditPanel;