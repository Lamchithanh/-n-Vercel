import React from "react";

const CourseCard = ({ course }) => {
    return (
        <div>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <img src={course.image} alt={course.title} />
        </div>
    );
};

export default CourseCard;
