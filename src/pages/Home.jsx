import React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/home.css'

export default function Home() {
  const nav = useNavigate()

  const prize = '$50,000'
  const contestants = 10

  return (
    <main className="home-page">
      <div className="home-container">
        <div className="home-content">
          
          {/* Header / Hero */}
          <div className="home-header">
            <div className="hero-content">
              <h1 className="hero-title">Mr. Beast (Fast Finger Challenge) — Win {prize}</h1>
              <p className="hero-description">
                Ten selected contestants compete in a high-stakes 24-hour window. The first contestant
                to successfully withdraw a wallet balance of {prize} within the active countdown is declared the winner.
                Speed and accuracy are everything, only one will take the prize.
              </p>

              <div className="hero-actions">
                <button onClick={() => nav('/login')} className="btn-primary">
                  Login
                </button>
                <button onClick={() => nav('/register')} className="btn-secondary">
                  Register
                </button>
              </div>

              {/* Contest quick stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Contestants</div>
                  <div className="stat-value">{contestants}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Prize</div>
                  <div className="stat-value">{prize}</div>
                </div>
              </div>
            </div>

            {/* Right column: contest card / rules */}
            <aside className="rules-sidebar">
              <h3 className="rules-title">How it works</h3>
              <div className="how-it-works">
                <ol>
                  <li>Ten contestants are selected and given access to the contest wallets.</li>
                  <li>Create an account and register. Then scroll to the message section on your dashboard and send: <strong>"I'm ready for the contest"</strong>. Your account will be credited with {prize} and the 24-hour countdown will start immediately for you.</li>
                  <li>Withdraw the credited funds from the platform as fast as possible, the first valid withdrawal during your active countdown wins the prize.</li>
                </ol>
              </div>

              <div className="official-rules">
                <h4>Official rules</h4>
                <ul>
                  <li>You must not share any information about the contest with anyone until the contest is over.</li>
                  <li>Create an account and register. After registration, send the message <strong>"I'm ready for the contest"</strong> from the message section on your dashboard to be credited with {prize}; doing so starts your 24-hour countdown immediately.</li>
                  <li>Withdraw the credited funds from the contest platform as quickly as possible, speed determines the winner.</li>
                  <li>Only withdrawals completed during the active countdown are eligible.</li>
                  <li>The organiser reserves the right to disqualify participants for rule violations.</li>
                </ul>
              </div>

              <div>
                <button onClick={() => nav('/rules')} className="rules-button">Read full rules</button>
              </div>

              <div className="contact-info">Need help? Contact: mrbeastcontest@gmail.com</div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}