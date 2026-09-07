import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper">
      <Link className="auth-home-link" to="/"><span aria-hidden="true">F</span> FoodReels</Link>
      <div className="auth-card" role="region" aria-labelledby="choose-register-title">
        <header>
          <p className="auth-eyebrow">One place, two ways to join</p>
          <h1 id="choose-register-title" className="auth-title">Register</h1>
          <p className="auth-subtitle">Pick how you want to join the platform.</p>
        </header>
        <div className="auth-choice-list">
          <Link to="/user/register" className="auth-submit" style={{textDecoration:'none'}}>
            Register as normal user
          </Link>
          <Link to="/food-partner/register" className="auth-submit auth-submit--alternate" style={{textDecoration:'none'}}>
            Register as food partner
          </Link>
        </div>
        <div className="auth-alt-action" style={{marginTop:'4px'}}>
          Already have an account? <Link to="/user/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
