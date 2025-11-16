import axios from "../../Service/AxiosCustomize";
import Cookies from "js-cookie";
const token = Cookies.get("accessToken");

// -------------------------------- COURSES -------------------------------

export const fetchAllMyCourses = () => async (dispatch) => {
  dispatch({ type: "COURSES_REQUEST" });
  try {
    const res = await axios.get("/api/courses/my-courses/approved/details", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: "COURSES_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "COURSES_FAILURE", payload: err.message });
  }
};

export const selectCourse = (courseId) => ({
  type: "SELECT_COURSE",
  payload: courseId,
});

export const resetCourses = () => ({
  type: "COURSES_RESET",
});

// -------------------------------- SCHEDULE -------------------------------

export const fetchSchedule = (courseId) => async (dispatch) => {
  dispatch({ type: "SCHEDULE_REQUEST" });
  try {
    const res = await axios.get(
      `/api/courses/my-courses/approved/${courseId}/schedule`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "SCHEDULE_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "SCHEDULE_FAILURE", payload: err.message });
  }
};

// -------------------------------- QUIZZES -------------------------------

export const fetchQuizzes = (courseId) => async (dispatch) => {
  dispatch({ type: "QUIZZES_REQUEST" });
  try {
    const res = await axios.get(
      `/api/courses/my-courses/approved/${courseId}/quizzes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "QUIZZES_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "QUIZZES_FAILURE", payload: err.message });
  }
};

export const fetchQuizDetailsById = (quizId) => async (dispatch) => {
  dispatch({ type: "QUIZ_DETAILS_REQUEST" });
  try {
    const res = await axios.get(`/api/quizzes/${quizId}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: "QUIZ_DETAILS_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "QUIZ_DETAILS_FAILURE", payload: err.message });
  }
};

export const selectQuiz = (quizId) => ({
  type: "QUIZ_SELECT",
  payload: quizId,
});

export const submitQuiz =
  (quizId, answers, startedAt, finishedAt, violationList) =>
  async (dispatch) => {
    dispatch({ type: "QUIZ_SUBMIT_REQUEST" });
    try {
      const res = await axios.post(
        `/api/quizzes/${quizId}/submit`,
        { answers, startedAt, finishedAt, violationList },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch({ type: "QUIZ_SUBMIT_SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "QUIZ_SUBMIT_FAILURE", payload: err.message });
    }
  };

export const fetchQuizResult = (quizId) => async (dispatch) => {
  dispatch({ type: "QUIZ_RESULT_REQUEST" });
  try {
    const res = await axios.get(`/api/quizzes/${quizId}/result`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: "QUIZ_RESULT_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "QUIZ_RESULT_FAILURE", payload: err.message });
  }
};

export const fetchQuizExplanations = (questions) => async (dispatch) => {
  dispatch({ type: "QUIZ_EXPLANATION_REQUEST" });
  try {
    const res = await axios.post(
      `/api/ai/explain-question`,
      { questions },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "QUIZ_EXPLANATION_SUCCESS", payload: res.explanations });
  } catch (err) {
    dispatch({
      type: "QUIZ_EXPLANATION_FAILURE",
      payload: err.response.data.message,
    });
  }
};

export const resetQuiz = () => ({
  type: "QUIZ_RESET",
});

// -------------------------------- ASSIGNMENTS -------------------------------

export const fetchAssignments = (courseId) => async (dispatch) => {
  dispatch({ type: "ASSIGNMENTS_REQUEST" });
  try {
    const res = await axios.get(
      `/api/courses/my-courses/approved/${courseId}/assignments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "ASSIGNMENTS_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "ASSIGNMENTS_FAILURE", payload: err.message });
  }
};

export const submitAssignment = (formData) => async (dispatch) => {
  dispatch({ type: "ASSIGNMENT_SUBMIT_REQUEST" });
  try {
    const res = await axios.post(`/api/assignments/submit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: "ASSIGNMENT_SUBMIT_SUCCESS", payload: res.data });
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    dispatch({
      type: "ASSIGNMENT_SUBMIT_FAILURE",
      payload: message,
    });
    throw new Error(message);
  }
};

export const selectAssignment = (assignmentId) => ({
  type: "ASSIGNMENT_SELECT",
  payload: assignmentId,
});

// -------------------------------- PROGRESS -------------------------------

export const fetchProgress = (courseId) => async (dispatch) => {
  dispatch({ type: "PROGRESS_REQUEST" });
  try {
    const res = await axios.get(
      `/api/courses/my-courses/approved/${courseId}/progress/details`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "PROGRESS_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "PROGRESS_FAILURE", payload: err.message });
  }
};
