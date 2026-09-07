import React from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { saveFoodPartnerId } from '../../utils/partnerSession';
import { clearUserId } from '../../utils/userSession';

const FoodPartnerLogin = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post("http://localhost:3000/api/auth/food-partner/login", {
      email,
      password
    }, { withCredentials: true });

    console.log(response.data);

    saveFoodPartnerId(response.data?.foodPartner);
    clearUserId();

    navigate("/create-food"); // Redirect to create food page after login

  };

  return (
    <div className="auth-page-wrapper">
      <Link className="auth-home-link" to="/"><span aria-hidden="true">F</span> FoodReels</Link>
      <div className="auth-card" role="region" aria-labelledby="partner-login-title">
        <header>
          <p className="auth-eyebrow">For food partners</p>
          <h1 id="partner-login-title" className="auth-title">Partner login</h1>
          <p className="auth-subtitle">Access your dashboard and manage orders.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <div className="auth-alt-action">
          New partner? <Link to="/food-partner/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;
