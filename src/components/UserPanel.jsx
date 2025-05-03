import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../style/UserPanel.css'

const initialForm = {
    workshop_name: "",
    ceo_name: "",
    staff_count: "",
    capacity: "",
    field_of_work: "",
    address: ""
};

const UserPanel = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();

    const [workshop, setWorkshop] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetch(`http://localhost/workshop-manager/src/backend/UserPanel.php?get_workshop=1&user_id=${userId}`)
            .then(res => res.json())
            .then(json => {
                if (json.workshop) {
                    setWorkshop(json.workshop);
                    setForm({
                        ...json.workshop,
                        staff_count: json.workshop.staff_count || "",
                        capacity: json.workshop.capacity || ""
                    });
                } else {
                    setWorkshop(null);
                    setForm(initialForm);
                }
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        fetch(`http://localhost/workshop-manager/src/backend/UserPanel.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, ...form, edit: !!workshop })
        })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    setWorkshop(json.workshop);
                    setEditMode(false);
                    setForm({
                        ...json.workshop,
                        staff_count: json.workshop.staff_count || "",
                        capacity: json.workshop.capacity || ""
                    });
                } else {
                    alert(json.message || "خطا در ذخیره اطلاعات");
                }
            });
    };

    const handleCancel = () => {
        if (workshop) {
            setForm({
                ...workshop,
                staff_count: workshop.staff_count || "",
                capacity: workshop.capacity || ""
            });
        } else {
            setForm(initialForm);
        }
        setEditMode(false);
    };

    const handleLogout = () => {
        // اگر نیاز به پاک‌کردن اطلاعات localStorage داری اینجا انجام بده
        navigate("/"); // فرض: صفحه ورود
    };

    const handleSchedule = () => {
        navigate("/schedule", { state: { workshopId: workshop.id } }); // انتقال user_id به SchedulePanel
       };

    if (!userId) return <div className="center-box"><span>در حال دریافت اطلاعات کاربر ...</span></div>;

    if (loading) return <div className="center-box"><span>در حال بارگذاری ...</span></div>;

    if (!workshop || editMode) {
        return (
            <div className="center-box">
                <h2>{workshop && editMode ? "ویرایش کارگاه" : "ثبت کارگاه جدید"}</h2>
                <form onSubmit={handleSubmit}>
                    <input name="workshop_name" required placeholder="نام کارگاه" value={form.workshop_name} onChange={handleChange} />
                    <input name="ceo_name" required placeholder="نام مدیر" value={form.ceo_name} onChange={handleChange} />
                    <input name="staff_count" required type="number" min="0" placeholder="تعداد پرسنل" value={form.staff_count} onChange={handleChange} />
                    <input name="capacity" required type="number" min="0" placeholder="ظرفیت" value={form.capacity} onChange={handleChange} />
                    <input name="field_of_work" required placeholder="زمینه فعالیت" value={form.field_of_work} onChange={handleChange} />
                    <textarea name="address" required placeholder="آدرس" value={form.address} onChange={handleChange} />
                    <button type="submit">{workshop && editMode ? "ذخیره تغییرات" : "ثبت"}</button>
                    {(workshop && editMode) && (
                        <button type="button" onClick={handleCancel} style={{ marginRight: 8, background: "#eee", color: "#225bd2" }}>
                            لغو
                        </button>
                    )}
                </form>
                <button onClick={handleLogout} style={{ marginTop: 24 }}>خروج</button>
            </div>
        );
    }

    return (
        <div className="center-box">
            <h2>اطلاعات کارگاه شما</h2>
            <table>
                <tbody>
                    <tr><th>نام کارگاه</th><td>{workshop.workshop_name}</td></tr>
                    <tr><th>نام مدیر</th><td>{workshop.ceo_name}</td></tr>
                    <tr><th>تعداد پرسنل</th><td>{workshop.staff_count}</td></tr>
                    <tr><th>ظرفیت</th><td>{workshop.capacity}</td></tr>
                    <tr><th>زمینه فعالیت</th><td>{workshop.field_of_work}</td></tr>
                    <tr><th>آدرس</th><td>{workshop.address}</td></tr>
                </tbody>
            </table>
            <button onClick={() => setEditMode(true)}>ویرایش</button>
            <button onClick={handleSchedule} style={{ marginLeft: 8 }}>رفتن به زمان‌بندی</button>
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>خروج</button>
        </div>
    );
};

export default UserPanel;
