import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const LoginSignup = () => {
    const [formState, setFormState] = useState("signup");
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (url, data) => {
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            return result; // Return the result to handle it in login
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        if (formData.password !== formData.confirm_password) {
            setErrorMessage('Passwords do not match');
            return;
        }
        const result = await handleSubmit('http://localhost:2000/signup', {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number,
            password: formData.password,
        });

        if (result.success) {
            alert('Signup successful');
            setFormState('login');
        } else {
            setErrorMessage(result.message || 'Signup failed');
        }
    };

    const login = async () => {
        const result = await handleSubmit('http://localhost:2000/login', {
            email: formData.email,
            password: formData.password,
        });

        if (result && result.success) {
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('loggedInEmail', formData.email); // Save email in localStorage
            window.location.replace("/"); // Redirect to the home page
        } else {
            setErrorMessage(result.message || 'Login failed');
        }
    };

    return (
        <div className="form">
            <div className="form-container">
                <h1>{formState === "signup" ? "Sign Up" : "Login"}</h1>
                <form>
                    {formState === "signup" && (
                        <>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="First name"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Last name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formPhoneNumber">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter Phone No"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Row>
                        </>
                    )}

                    {formState === "login" && (
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Row>
                    )}

                    <Row className="mb-3">
                        <Form.Group as={Col} controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        {formState === "signup" && (
                            <Form.Group as={Col} controlId="formConfirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        )}
                    </Row>

                    {errorMessage && <div className="error">{errorMessage}</div>}
                    <Button
                        variant="primary"
                        onClick={formState === "signup" ? signUp : login}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : formState === "signup" ? "Sign Up" : "Login"}
                    </Button>
                </form>

                <div className="toggle-form">
                    <button onClick={() => setFormState(formState === "signup" ? "login" : "signup")}>
                        {formState === "signup" ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
