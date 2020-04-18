import styled from "styled-components";

export const ButtonContainer = styled.button`
text-transform:capitalize;
font-size:1.2rem;
background:var(--mainWhite);
border:0.05rem solid var(--mainDark);
border-color:${props => (props.cart? "var(--mainYellow)":"var(--mainDark)")};
color:${prop => (prop.cart? "var(--mainYellow)":"var(--mainDark)")};
border-radius:0.5rem;
padding: 0.2rem 0.5rem;
cursor:pointer;
margin:0.2rem;

transition:all 0.5s ease-in-out;
&:hover{
    background:${prop => (prop.cart? "var(--mainYellow)":"var(--mainDark)")};
    color:${prop => (prop.cart? "var(--mainWhite)":"var(--mainWhite)")};
}
&:focus{
    outline: none;
}
`;