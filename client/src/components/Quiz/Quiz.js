import React from "react";

const Quiz = ({ quiz }) => {
    return (
        <div>
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
        </div>
    );
};

export default Quiz;
