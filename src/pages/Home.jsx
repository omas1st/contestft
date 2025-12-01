import React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/home.css'

export default function Home() {
  const nav = useNavigate()

  const prize = '$50,000'
  const teamCaptains = 10
  const teamMembers = 4
  const timeLimit = '72 hours'
  const withdrawalTime = '24 hours'
  const individualPrize = '$10,000'

  return (
    <main className="home-page">
      <div className="home-container">
        <div className="home-content">
          
          {/* Header / Hero */}
          <div className="home-header">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to the $50,000 Mr Beast Recruitment Rush!</h1>
              <div className="hero-description">
                <p className="description-paragraph">
                  We start with ten team captains. Each captain has one mission: be the fastest to build a team of five brand-new members recruited from anywhere online.
                </p>
                <p className="description-paragraph">
                  The first captain to successfully recruit four people wins the grand prize for their entire team! That captain and each of their four new members will instantly receive $10,000 each, crediting $50,000 in total prizes to one winning team.
                </p>
                <p className="description-paragraph">
                  <strong>But speed is key!</strong> You only have 72 hours from the start to find your four members. Once the money is in your platform wallet, you must withdraw it within 24 hours or you will lose it.
                </p>
                <p className="description-paragraph">
                  When you join, you must send a direct message to the game's official account stating the name of the captain who invited you. This is the only way to ensure you are correctly added to their team and become eligible for the prize.
                </p>
              </div>

              <div className="hero-actions">
                <button onClick={() => nav('/login')} className="btn-primary">
                  Join as Team Member
                </button>
                <button onClick={() => nav('/register')} className="btn-secondary">
                  Register as Captain
                </button>
              </div>

              {/* Contest quick stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Team Captains</div>
                  <div className="stat-value">{teamCaptains}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Prize</div>
                  <div className="stat-value">{prize}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Members per Team</div>
                  <div className="stat-value">{teamMembers}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Time Limit</div>
                  <div className="stat-value">{timeLimit}</div>
                </div>
              </div>
            </div>

            {/* Right column: Official Rules */}
            <aside className="rules-sidebar">
              <h3 className="rules-title">Official Game Rules</h3>
              <div className="official-rules-section">
                <h4>The $50,000 Team Rush: Official Rules</h4>
                
                <div className="rule-section">
                  <h5>1. Objective</h5>
                  <p>Be the first Team Captain to recruit a full team of four(4) verified members. The first captain to complete this goal wins a $10,000 prize for themselves and for each of their four team members.</p>
                </div>

                <div className="rule-section">
                  <h5>2. Eligibility</h5>
                  <ul>
                    <li>Must be at least 13 years old.</li>
                    <li>Must have a valid account on [YouTube or TikTok or Facebook].</li>
                    <li>Employees of MrBeast and their immediate families are ineligible.</li>
                  </ul>
                </div>

                <div className="rule-section">
                  <h5>3. How to Play</h5>
                  <ul>
                    <li><strong>For Team Captains:</strong> The ten (10) pre-selected captains will be announced at the start of the game. You will have 72 hours to recruit four (4) new players to join your team.</li>
                    <li><strong>For New Members:</strong> To join a team, you must be recruited by a captain. Upon signing up, you MUST send a direct message to via the in-app message containing the phrase: "Joined by [Captain's Name]". Failure to do this correctly will result in you not being counted on that captain's team.</li>
                  </ul>
                </div>

                <div className="rule-section">
                  <h5>4. Winning</h5>
                  <ul>
                    <li>The victory condition is met the moment the first Team Captain has four (4) registered members who have correctly verified their recruitment via DM.</li>
                    <li>The winning team consists of the one (1) winning Captain and their four (4) verified Members.</li>
                    <li>Each of these five (5) individuals will be credited $10,000 into their platform wallet, for a total prize pool of $50,000.</li>
                  </ul>
                </div>

                <div className="rule-section">
                  <h5>5. Prize Claim & Withdrawal</h5>
                  <ul>
                    <li>Prizes will be deposited into the winner's in-app wallet within 1 hour of the winning team being verified.</li>
                    <li>Winners have 24 hours from the time the prize is deposited to initiate a withdrawal to their designated bank account or payment processor (e.g., PayPal).</li>
                    <li>Failure to withdraw within the 24-hour window will result in the forfeiture of the prize. No exceptions will be made.</li>
                  </ul>
                </div>

                <div className="rule-section">
                  <h5>6. General Conditions</h5>
                  <ul>
                    <li>All recruitment must be organic. The use of bots, automated systems, or paid advertising to recruit members is strictly prohibited and will result in immediate disqualification.</li>
                    <li>MrBeast is not responsible for technical errors, failed messages, or user error in the recruitment process.</li>
                    <li>We reserve the right to modify these rules or cancel the game at our discretion, though we are committed to fulfilling the promised prize for the winning team.</li>
                  </ul>
                </div>

                <div className="good-luck">
                  <p>Good luck, and may the fastest team win!</p>
                </div>
              </div>

              <div className="sidebar-actions">
                <button onClick={() => nav('/rules')} className="rules-button">View Detailed Rules</button>
                <div className="contact-info">Need help? Contact: recruitmentrush@mrbeast.com</div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
