import useAuthRedirect from "../../../hooks/useAuthRedirect";
import profileIcon from "../../../assets/filesSvg/filesdashboardSvg/profile.svg";

const Dashboard = () => {
    useAuthRedirect(); // Custom hook to handle redirection if not authenticated
    return (
        <div className="header-dashboard-container">
            <div className="item-header-dashboard">
                <svg
                    className="dashboard-icon-fire"
                    viewBox="415 411 26 32"
                    fill="#FF7C02"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M428.5,441 C422.148,441 417,435.641 417,429.625 C417,428.228 417.031,427.094 418,426 C417.895,426.634 419.397,432.055 424.305,431.771 C424.092,427.652 422.978,417.561 428.152,414.073 C427.695,419.557 429.038,426.924 435.029,428 C434.686,425.801 434.727,422.143 436.267,421.467 C436.433,424.836 438.924,426.914 438.924,430.152 C438.924,436.016 433.251,441 428.5,441 L428.5,441 Z M437.905,417.953 C433.52,419.203 432.717,422.748 433,425 C429.872,421.322 430,417.093 430,411 C419.968,414.783 422.301,425.688 422,429 C419.477,426.935 419,422 419,422 C416.336,423.371 415,427.031 415,430 C415,437.18 420.82,443 428,443 C435.18,443 441,437.18 441,430 C441,425.733 437.867,423.765 437.905,417.953 L437.905,417.953 Z"
                        fill="#FF7C02"
                    />
                </svg>
            </div>
            <div className="item-header-dashboard">500 pts</div>
            <div className="item-header-dashboard-profile">
                <img
                    src={profileIcon}
                    alt="Profile Icon"
                    // style={{ width: "50px", height: "50px" }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
