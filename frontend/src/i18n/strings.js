/* =========================================================
   HealthTwin AI — i18n string table
   All user-facing text. Add new keys to both en + hi.
   ========================================================= */

const strings = {
  en: {
    // Navbar
    nav_dashboard: "Dashboard",
    nav_assessment: "Assessment",
    nav_simulate: "Simulate",
    nav_forecast: "Forecast",
    nav_history: "History",
    nav_chat: "Chat",
    nav_trends: "Trends",
    nav_twin: "Twin",
    nav_logout: "Logout",
    demo_banner: "Demo Mode — sample data, not a real assessment",
    exit_demo: "Exit Demo",

    // Login / Signup
    login_title: "Welcome back",
    login_subtitle: "Your personalised health intelligence system",
    login_username: "Username",
    login_password: "Password",
    login_username_placeholder: "Enter your username",
    login_password_placeholder: "Enter your password",
    login_btn: "Sign In",
    login_no_account: "Don't have an account?",
    login_create: "Create account",
    login_tagline: "All data stays on your device. No cloud sharing.",
    try_demo: "Try Demo",

    signup_title: "Create your account",
    signup_fullname: "Full Name",
    signup_fullname_placeholder: "e.g. Ramesh Kumar",
    signup_btn: "Create Account",
    signup_have_account: "Already have an account?",
    signup_sign_in: "Sign in",

    // Assessment
    assess_step_personal: "Personal Information",
    assess_step_clinical: "Clinical Readings",
    assess_step_lifestyle: "Lifestyle & Habits",
    assess_step_family: "Family History",
    assess_next: "Next",
    assess_back: "Back",
    assess_submit: "Submit & Analyse",
    assess_analysing: "Analysing...",

    // Dashboard
    dash_title: "Health Dashboard",
    dash_welcome: "Welcome back",
    dash_retake: "Retake Assessment",
    dash_start: "Start Assessment",
    dash_twin: "Digital Twin",
    dash_trends: "View Trends",
    dash_simulate: "Simulate",
    dash_pdf: "PDF",
    dash_overview: "📊 Overview",
    dash_explainability: "🔍 Explainability",
    dash_recommendations: "💡 Recommendations",
    dash_no_results: "No assessment yet",
    dash_no_results_sub: "Complete your first health assessment to see your personalised Digital Twin.",
    dash_get_started: "🩺 Get Started",
    dash_get_recs: "💡 Get Personalised Recommendations",

    // Risk labels
    risk_high: "High",
    risk_moderate: "Moderate",
    risk_low: "Low",
    risk_map: "Risk map — your body systems",

    // Results page
    results_title: "Your Health Assessment Results",
    results_subtitle: "Digital Twin body map — AI risk analysis",
    results_twin_live: "Digital Twin — Live",
    results_top_drivers: "Top Risk Drivers",
    results_shap_label: "Feature Impact",
    results_view_twin: "View Full Digital Twin →",
    results_dashboard: "Go to Dashboard",
    results_insight_prefix: "Twin insight: ",
    results_insight_low: "All risk levels manageable. Your twin is in good shape — keep up your current lifestyle.",
    results_insight_high: "High {condition} risk detected. Key driver: \"{feature}\". Use Simulate to see how lifestyle changes can reduce this.",

    // Conditions
    cond_diabetes: "Type 2 Diabetes",
    cond_hypertension: "Hypertension",
    cond_heart: "Heart Disease",
    cond_obesity: "Obesity",
    cond_stress: "Stress",
    health_score: "Health Score",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
  },

  hi: {
    // Navbar
    nav_dashboard: "डैशबोर्ड",
    nav_assessment: "आकलन",
    nav_simulate: "सिम्युलेट",
    nav_forecast: "पूर्वानुमान",
    nav_history: "इतिहास",
    nav_chat: "चैट",
    nav_trends: "रुझान",
    nav_twin: "ट्विन",
    nav_logout: "लॉगआउट",
    demo_banner: "डेमो मोड — नमूना डेटा, वास्तविक आकलन नहीं",
    exit_demo: "डेमो बंद करें",

    // Login / Signup
    login_title: "वापस स्वागत है",
    login_subtitle: "आपका व्यक्तिगत स्वास्थ्य सूचना तंत्र",
    login_username: "उपयोगकर्ता नाम",
    login_password: "पासवर्ड",
    login_username_placeholder: "उपयोगकर्ता नाम दर्ज करें",
    login_password_placeholder: "पासवर्ड दर्ज करें",
    login_btn: "साइन इन",
    login_no_account: "खाता नहीं है?",
    login_create: "खाता बनाएं",
    login_tagline: "सभी डेटा आपके डिवाइस पर सुरक्षित। कोई क्लाउड साझाकरण नहीं।",
    try_demo: "डेमो देखें",

    signup_title: "खाता बनाएं",
    signup_fullname: "पूरा नाम",
    signup_fullname_placeholder: "जैसे रमेश कुमार",
    signup_btn: "खाता बनाएं",
    signup_have_account: "पहले से खाता है?",
    signup_sign_in: "साइन इन करें",

    // Assessment
    assess_step_personal: "व्यक्तिगत जानकारी",
    assess_step_clinical: "नैदानिक रीडिंग",
    assess_step_lifestyle: "जीवनशैली और आदतें",
    assess_step_family: "पारिवारिक इतिहास",
    assess_next: "अगला",
    assess_back: "वापस",
    assess_submit: "जमा करें और विश्लेषण करें",
    assess_analysing: "विश्लेषण हो रहा है...",

    // Dashboard
    dash_title: "स्वास्थ्य डैशबोर्ड",
    dash_welcome: "वापस स्वागत है",
    dash_retake: "पुनः आकलन",
    dash_start: "आकलन शुरू करें",
    dash_twin: "डिजिटल ट्विन",
    dash_trends: "रुझान देखें",
    dash_simulate: "सिम्युलेट",
    dash_pdf: "PDF",
    dash_overview: "📊 अवलोकन",
    dash_explainability: "🔍 व्याख्या",
    dash_recommendations: "💡 सुझाव",
    dash_no_results: "अभी कोई आकलन नहीं",
    dash_no_results_sub: "अपना पहला स्वास्थ्य आकलन पूरा करें।",
    dash_get_started: "🩺 शुरू करें",
    dash_get_recs: "💡 व्यक्तिगत सुझाव प्राप्त करें",

    // Risk labels
    risk_high: "उच्च",
    risk_moderate: "मध्यम",
    risk_low: "कम",
    risk_map: "जोखिम मानचित्र — आपके शरीर के तंत्र",

    // Results page
    results_title: "आपके स्वास्थ्य आकलन के परिणाम",
    results_subtitle: "डिजिटल ट्विन बॉडी मैप — AI जोखिम विश्लेषण",
    results_twin_live: "डिजिटल ट्विन — लाइव",
    results_top_drivers: "शीर्ष जोखिम कारण",
    results_shap_label: "विशेषता प्रभाव",
    results_view_twin: "पूरा डिजिटल ट्विन देखें →",
    results_dashboard: "डैशबोर्ड पर जाएं",
    results_insight_prefix: "ट्विन अंतर्दृष्टि: ",
    results_insight_low: "सभी जोखिम स्तर नियंत्रणीय हैं। आपका ट्विन अच्छी स्थिति में है।",
    results_insight_high: "उच्च {condition} जोखिम पाया गया। मुख्य कारण: \"{feature}\"। सिम्युलेट टैब में बदलाव देखें।",

    // Conditions
    cond_diabetes: "टाइप 2 मधुमेह",
    cond_hypertension: "उच्च रक्तचाप",
    cond_heart: "हृदय रोग",
    cond_obesity: "मोटापा",
    cond_stress: "तनाव",
    health_score: "स्वास्थ्य स्कोर",
    good: "अच्छा",
    fair: "ठीक",
    poor: "खराब",
  }
}

export default strings
