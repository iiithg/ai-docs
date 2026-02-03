import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import './Leaderboard.css'

const Leaderboard = () => {
  const { user } = useAuth()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'username', 'email'

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // Use RPC to get each user's highest score only
      const { data, error } = await supabase
        .rpc('get_leaderboard', { limit_count: 100 })

      if (error) {
        // Fallback: manual query if RPC doesn't exist
        console.warn('RPC not found, using fallback query')
        const { data: rawData, error: rawError } = await supabase
          .from('leaderboard')
          .select(`
            id,
            score,
            snake_length,
            game_duration,
            created_at,
            username,
            profiles (email)
          `)
          .order('score', { ascending: false })
          .limit(100)

        if (rawError) {
          console.error('Error fetching leaderboard:', rawError)
          setScores([])
        } else {
          // Group by user_id and keep highest score
          const userMap = new Map()
          rawData.forEach(item => {
            const existing = userMap.get(item.user_id)
            if (!existing || item.score > existing.score) {
              userMap.set(item.user_id, {
                ...item,
                email: item.profiles?.email || 'N/A',
              })
            }
          })
          setScores(Array.from(userMap.values()).sort((a, b) => b.score - a.score))
        }
      } else {
        // Transform RPC result
        const transformedData = data.map(item => ({
          ...item,
          email: item.email || 'N/A',
        }))
        setScores(transformedData)
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setScores([])
    }
    setLoading(false)
  }

  const getFilteredScores = () => {
    if (!searchTerm.trim()) return scores

    const search = searchTerm.toLowerCase()

    return scores.filter((score) => {
      if (filterType === 'username' || filterType === 'all') {
        if (score.username?.toLowerCase().includes(search)) {
          return true
        }
      }
      if (filterType === 'email' || filterType === 'all') {
        if (score.email?.toLowerCase().includes(search)) {
          return true
        }
      }
      return false
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const filteredScores = getFilteredScores()

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top Snake Game Players</p>
      </div>

      <div className="leaderboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
          </select>
        </div>
        <button onClick={fetchLeaderboard} className="refresh-btn">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="leaderboard-loading">Loading scores...</div>
      ) : (
        <>
          <div className="leaderboard-stats">
            <span>Total Players: {scores.length}</span>
            {user && (
              <span>
                Your Best:{' '}
                {scores.find((s) => s.username === user.user_metadata?.username)
                  ?.score || 'N/A'}
              </span>
            )}
          </div>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-col">Rank</th>
                <th className="username-col">Player</th>
                <th className="email-col">Email</th>
                <th className="score-col">Score</th>
                <th className="length-col">Length</th>
                <th className="date-col">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score, index) => {
                const rank = scores.findIndex((s) => s.id === score.id) + 1
                return (
                  <tr
                    key={score.id}
                    className={
                      user &&
                      score.username === user.user_metadata?.username
                        ? 'current-user'
                        : ''
                    }
                  >
                    <td className="rank-col">{getRankBadge(rank)}</td>
                    <td className="username-col">
                      <span className="player-name">{score.username}</span>
                    </td>
                    <td className="email-col">{score.email}</td>
                    <td className="score-col">{score.score.toLocaleString()}</td>
                    <td className="length-col">{score.snake_length}</td>
                    <td className="date-col">{formatDate(score.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredScores.length === 0 && (
            <div className="leaderboard-empty">
              {searchTerm
                ? 'No players match your search'
                : 'No scores yet. Be the first!'}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Leaderboard
