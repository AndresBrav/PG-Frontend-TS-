import useAuthRedirect from "../../../hooks/useAuthRedirect";

const Dashboard = () => {
    useAuthRedirect(); // Custom hook to handle redirection if not authenticated
    return (
        <div>
            <h1>ESto sera el inicio donde estaran los juegos </h1>
        </div>
    );
};

export default Dashboard;
