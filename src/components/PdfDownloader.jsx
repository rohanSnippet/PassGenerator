import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";
import { useAuth } from "../AuthContext";
import { createSignedUrl } from "../Services";
import { useNavigate } from "react-router-dom";

const ReportTemplate = ({ profile }) => {
  const styles = {
    page: {
      backgroundColor: "#0a192f",
      background:
        "radial-gradient(circle at 25% 25%, rgba(37,99,235,0.15) 0%, transparent 55%), linear-gradient(135deg, #0a192f 0%, #1a365d 100%)",
      padding: "2rem",
      borderRadius: "4px",
      margin: "0rem",
      fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
      color: "#e6f1ff",
      maxWidth: "600px",
      margin: "0 auto",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        "radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.15) 0%, transparent 55%)",
      zIndex: 0,
    },
    content: {
      position: "relative",
      zIndex: 1,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: "1.5rem",
      marginBottom: "1.5rem",
      borderBottom: "1px solid rgba(255,255,255,0.2)",
    },
    eventLogo: {
      width: "80px",
      height: "80px",
      borderRadius: "12px",
      backgroundColor: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "1.2rem",
      color: "#0a192f",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
    titleContainer: {
      textAlign: "center",
      flexGrow: 1,
    },
    mainTitle: {
      fontSize: "2.2rem",
      fontWeight: "800",
      margin: "0",
      background: "linear-gradient(90deg, #63b3ed 0%, #4299e1 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "1px",
      textTransform: "uppercase",
    },
    subtitle: {
      fontSize: "1rem",
      margin: "0.3rem 0 0 0",
      fontWeight: "300",
      color: "#a3bffa",
      letterSpacing: "0.5px",
    },
    profileSection: {
      display: "flex",
      marginBottom: "1.5rem",
      gap: "1.5rem",
    },
    profileImage: {
      width: "140px",
      height: "170px",
      borderRadius: "10px",
      backgroundColor: "rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.8rem",
      textAlign: "center",
      padding: "0.5rem",
      border: "1px solid rgba(255,255,255,0.15)",
      overflow: "hidden",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    profileDetails: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    detailRow: {
      display: "flex",
      marginBottom: "0.8rem",
      paddingBottom: "0.5rem",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    },
    detailLabel: {
      fontWeight: "600",
      width: "120px",
      color: "#90cdf4",
      fontSize: "0.9rem",
    },
    detailValue: {
      flex: 1,
      fontWeight: "400",
      fontSize: "0.95rem",
    },
    passId: {
      textAlign: "center",
      background: "linear-gradient(90deg, #4c6ef5 0%, #3b5bdb 100%)",
      color: "white",
      padding: "0.8rem",
      borderRadius: "8px",
      margin: "1.5rem 0",
      fontWeight: "700",
      letterSpacing: "1.5px",
      fontSize: "1.1rem",
      boxShadow: "0 4px 12px rgba(59, 91, 219, 0.4)",
    },
    securityFeatures: {
      display: "flex",
      justifyContent: "space-around",
      margin: "1.5rem 0",
      opacity: "0.9",
    },
    securityFeature: {
      textAlign: "center",
      fontSize: "0.8rem",
      padding: "0.5rem",
      borderRadius: "8px",
      backgroundColor: "rgba(255,255,255,0.05)",
      width: "30%",
    },
    qrCode: {
      width: "90px",
      height: "90px",
      borderRadius: "8px",
      backgroundColor: "#fff",
      margin: "0.5rem auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.7rem",
      color: "#0a192f",
      fontWeight: "600",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    footer: {
      textAlign: "center",
      marginTop: "1.5rem",
      paddingTop: "1.5rem",
      borderTop: "1px solid rgba(255,255,255,0.2)",
      fontSize: "0.75rem",
      color: "#a3bffa",
    },
    decorativeElement: {
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(66, 153, 225, 0.3) 0%, rgba(34, 102, 204, 0.1) 100%)",
      zIndex: 0,
    },
    decorativeElement2: {
      position: "absolute",
      top: "30px",
      left: "30px",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(99, 179, 237, 0.3) 0%, rgba(66, 153, 225, 0.1) 100%)",
      zIndex: 0,
    },
  };
  const [signedURL, setSignedURL] = useState(null);
  useEffect(() => {
    if (profile?.passport_photo_url) {
      createSignedUrl(profile?.passport_photo_url).then(setSignedURL);
    }
  }, [profile]);

  return (
    <div style={styles.page}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.decorativeElement}></div>
      <div style={styles.decorativeElement2}></div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.eventLogo}>
            <span>
              <img
                src="https://res.cloudinary.com/dryxgvjhu/image/upload/v1752142159/AEG_Maharashtra_Logo_zjs0jo.png"
                alt="AEG Logo"
              />
            </span>
          </div>
          <div style={styles.titleContainer}>
            {/* <h1 style={styles.mainTitle}>AEG Event</h1> */}
            <img
              style={{ margin: "0 0 0 52px" }}
              src="https://res.cloudinary.com/dryxgvjhu/image/upload/v1755861404/AEG_Event_pass_header-removebg-preview-Picsart-AiImageEnhancer_vua8wk.png"
              alt=""
              width={250}
            />
            <p style={styles.subtitle}>Exclusive Access Pass</p>
          </div>
          <div style={styles.eventLogo}>
            <span>2025</span>
          </div>
        </div>

        <div style={styles.profileSection}>
          <div style={styles.profileImage}>
            {signedURL ? (
              <img
                src={signedURL}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              "Profile Photo"
            )}
          </div>
          <div style={styles.profileDetails}>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Name:</div>
              <div style={styles.detailValue}>
                {profile?.name || "Full Name"}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>DOB:</div>
              <div style={styles.detailValue}>
                {profile?.dob || "Organization Name"}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Age:</div>
              <div style={styles.detailValue}>
                {profile?.age || "Position/Rank"}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Event:</div>
              <div style={styles.detailValue}>
                {profile?.event_name || "AEG Jalna Seminar 2025"}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Date:</div>
              <div style={styles.detailValue}>
                {profile?.event_date || "August 24th, 2025"}
              </div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Location:</div>
              <div style={styles.detailValue}>
                {profile?.event_location ||
                  "Social Justice Hall, Near Collector Office, Jalna"}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.passId}>
          PASS ID: {profile?.user_pass_id || "AEG-2025-XXXXX"}
        </div>

       {/*  <div style={styles.securityFeatures}>
          <div style={styles.securityFeature}>
            <div>Hologram</div>
            <div
              style={{
                fontSize: "1.8rem",
                marginTop: "0.3rem",
                color: "#90cdf4",
              }}
            >
              ◉
            </div>
          </div>
          <div style={styles.securityFeature}>
            <div>QR Code</div>
            <div style={styles.qrCode}>
              <div>Scan Me</div>
            </div>
          </div>
          <div style={styles.securityFeature}>
            <div>Watermark</div>
            <div
              style={{
                fontSize: "1.8rem",
                marginTop: "0.3rem",
                color: "#90cdf4",
              }}
            >
              ◑
            </div>
          </div>
        </div> */}

        <div style={styles.footer}>
          <p>
            <strong>OFFICIAL EVENT PASS</strong>
          </p>
          <p>This pass must be displayed at all times during the event</p>
          <p>Valid with photo ID</p>
          <p>© 2025 AEG Events • aegmaharashtra.com</p>
        </div>
      </div>
    </div>
  );
};

const PdfDownloader = () => {
  const reportTemplateRef = useRef(null);
  const { session, getUserProfile } = useAuth();
  const user = session?.user;
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      getUserProfile(user.id).then(setProfile);
    }
  }, [user]);

  /* const handleGeneratePdf = () => {
    const doc = new jsPDF({
      format: "a4",
      unit: "px",
    });

    // Adding the fonts.
    doc.setFont("Helvetica", "normal");

    doc.html(reportTemplateRef.current, {
      async callback(doc) {
        await doc.save(`${profile?.user_pass_id || "event_pass"} Event Pass`);
      },
      html2canvas: {
        scale: 2 // Higher quality
      }
    });
  }; */

  const handleGeneratePdf = () => {
    const element = reportTemplateRef.current;
    const opt = {
      margin: 0, // remove default margins
      filename: `${profile?.user_pass_id || "event_pass"}_Event_Pass.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: {
        unit: "px",
        format: [element.offsetWidth, element.offsetHeight],
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Sticky header with download button */}
      <div className="sticky top-0 z-10 bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xl text-white px-3 py-1 rounded-none shadow-sm shadow-gray-300 libre-baskerville-bold bg-secondary"
        >
          Dashboard
        </button>
        <button
          className="bg-secondary text-white libre-baskerville-bold py-2 px-6 rounded-none shadow-md transition-colors flex items-center"
          onClick={handleGeneratePdf}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            ></path>
          </svg>
          Download PDF
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 p-4 bg-gray-100">
        <div
          ref={reportTemplateRef}
          className="bg-white rounded-xs shadow-lg p-1 max-w-xl mx-auto"
        >
          <ReportTemplate profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default PdfDownloader;
