import React, { useState, useEffect } from "react";
import axios from "axios";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({ name: "", description: "" });
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      const response = await axios.get("/api/Sessions", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      });
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const createSession = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      await axios.post("/api/Sessions", newSession, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewSession({ name: "", description: "" });
      fetchSessions();
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const updateSession = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      await axios.put(`/api/Sessions/${id}`, editingSession, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingSession(null);
      fetchSessions();
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const deleteSession = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from local storage
      await axios.delete(`/api/Sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return (
    <div>
      <h1>Sessions</h1>
      <div>
        <h2>Create Session</h2>
        <input
          type="text"
          placeholder="Name"
          value={newSession.name}
          onChange={(e) =>
            setNewSession({ ...newSession, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          value={newSession.description}
          onChange={(e) =>
            setNewSession({ ...newSession, description: e.target.value })
          }
        />
        <button onClick={createSession}>Create</button>
      </div>
      <div>
        <h2>All Sessions</h2>
        <ul>
          {sessions.map((session) => (
            <li key={session.sessionId}>
              <strong>{session.name}</strong>: {session.description}
              <button onClick={() => setEditingSession(session)}>Edit</button>
              <button onClick={() => deleteSession(session.sessionId)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      {editingSession && (
        <div>
          <h2>Edit Session</h2>
          <input
            type="text"
            placeholder="Name"
            value={editingSession.name}
            onChange={(e) =>
              setEditingSession({ ...editingSession, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            value={editingSession.description}
            onChange={(e) =>
              setEditingSession({
                ...editingSession,
                description: e.target.value,
              })
            }
          />
          <button onClick={() => updateSession(editingSession.sessionId)}>
            Save
          </button>
          <button onClick={() => setEditingSession(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Sessions;
