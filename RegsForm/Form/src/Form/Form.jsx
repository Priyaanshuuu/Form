import React, { useState, useRef } from 'react';
import './Form.css';

const NOC_GUIDELINES = [
    'Fire extinguishers installed',
    'Emergency exits are accessible',
    'Smoke detectors are operational',
    'Fire drills conducted',
    'Electrical wiring inspected',
    'Sprinkler system operational',
    'Emergency lighting functional',
    'Fire alarm system tested',
    'Exit signage is clear',
    'Hazardous materials properly stored',
    'Emergency contact numbers updated'
];

const InspectionReportForm = () => {
    const [formData, setFormData] = useState({
        inspectorName: '',
        date: '',
        location: '',
        comments: '',
        status: 'pass',
        signature: null,
        nocChecklist: NOC_GUIDELINES.reduce((acc, item) => {
            acc[item] = { checked: false, comment: '' };
            return acc;
        }, {}),
    });

    const [errors, setErrors] = useState({});
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [isChecklistVisible, setIsChecklistVisible] = useState(false);
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);

    const handleChange = (e) => {
        if (e.target.name.startsWith('comment')) {
            const checklistItem = e.target.name.split('-')[1];
            setFormData({
                ...formData,
                nocChecklist: {
                    ...formData.nocChecklist,
                    [checklistItem]: {
                        ...formData.nocChecklist[checklistItem],
                        comment: e.target.value,
                    },
                },
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleChecklistChange = (e, item) => {
        const isChecked = e.target.checked;
        setFormData({
            ...formData,
            nocChecklist: {
                ...formData.nocChecklist,
                [item]: {
                    ...formData.nocChecklist[item],
                    checked: isChecked,
                },
            },
        });
    };

    const handleSignatureStart = () => {
        isDrawing.current = true;
    };

    const handleSignatureEnd = () => {
        isDrawing.current = false;
        const canvas = canvasRef.current;
        setSignaturePreview(canvas.toDataURL());
        setFormData({ ...formData, signature: canvas.toDataURL() });
    };

    const handleSignatureDraw = (e) => {
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleSignatureClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignaturePreview(null);
        setFormData({ ...formData, signature: null });
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setSignaturePreview(reader.result);
            setFormData({ ...formData, signature: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        let newErrors = {};

        if (!formData.inspectorName) {
            newErrors.inspectorName = 'Inspector name is required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.location) {
            newErrors.location = 'Location is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Handle form submission
            console.log('Inspection Report Submitted:', formData);
        }
    };

    const toggleChecklistVisibility = () => {
        setIsChecklistVisible(!isChecklistVisible);
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <h2>Inspection Report</h2>

                <div className="form-group">
                    <label htmlFor="inspectorName">Inspector Name</label>
                    <input
                        type="text"
                        id="inspectorName"
                        name="inspectorName"
                        value={formData.inspectorName}
                        onChange={handleChange}
                        className={errors.inspectorName ? 'error' : ''}
                    />
                    {errors.inspectorName && <p className="error-message">{errors.inspectorName}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={errors.date ? 'error' : ''}
                    />
                    {errors.date && <p className="error-message">{errors.date}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={errors.location ? 'error' : ''}
                    />
                    {errors.location && <p className="error-message">{errors.location}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="comments">Comments</label>
                    <textarea
                        id="comments"
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="noc-checklist">NOC Guidelines Checklist</label>
                    <button
                        type="button"
                        className="toggle-button"
                        onClick={toggleChecklistVisibility}
                    >
                        {isChecklistVisible ? 'Hide Checklist' : 'Show Checklist'}
                    </button>
                    {isChecklistVisible && (
                        <div className="noc-checklist">
                            {Object.keys(formData.nocChecklist).map((item, index) => (
                                <div key={index} className="checklist-item">
                                    <input
                                        type="checkbox"
                                        id={`noc-${index}`}
                                        checked={formData.nocChecklist[item].checked}
                                        onChange={(e) => handleChecklistChange(e, item)}
                                    />
                                    <label htmlFor={`noc-${index}`}>{item}</label>
                                    <textarea
                                        name={`comment-${item}`}
                                        value={formData.nocChecklist[item].comment}
                                        onChange={handleChange}
                                        placeholder="Add comment"
                                    ></textarea>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Digital Signature</label>
                    <canvas
                        id="signature"
                        ref={canvasRef}
                        width="400"
                        height="150"
                        onMouseDown={handleSignatureStart}
                        onMouseUp={handleSignatureEnd}
                        onMouseMove={handleSignatureDraw}
                        className="signature-canvas"
                    ></canvas>
                    <input
                        type="file"
                        id="signatureUpload"
                        name="signatureUpload"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="signature-upload"
                    />
                    <div className="signature-buttons">
                        <button type="button" onClick={handleSignatureClear}>
                            Clear
                        </button>
                    </div>
                    {signaturePreview && (
                        <div className="signature-preview">
                            <img src={signaturePreview} alt="Signature Preview" />
                        </div>
                    )}
                </div>

                <button type="submit">Submit Report</button>
            </form>
        </div>
    );
};

export default InspectionReportForm;

