import { LinkContainer } from "react-router-bootstrap";
import React from 'react';
import { Auth } from "aws-amplify";
import { Link, useHistory } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { useAppContext } from "../libs/contextLib";
import './TopNav.css';

export default function TopNav(props) {
    const { isAuthenticated, setIsAuthenticated } = useAppContext();
    const history = useHistory();
    
    const handleLogout = async () => {
        await Auth.signOut();
        setIsAuthenticated(false);
        history.push("/login");
      }
    
    return (
        <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Scratch</Link>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
          { isAuthenticated ?
          <>
            <LinkContainer to="/settings">
                <NavItem>Settings</NavItem>
            </LinkContainer>
            <NavItem onClick={handleLogout}>Logout</NavItem>
          </> : 
            <>
            <LinkContainer to="/signup">
                <NavItem>Signup</NavItem>
            </LinkContainer>
            <LinkContainer to="/login">
                <NavItem>Login</NavItem>
            </LinkContainer>
            </>
          }
          
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
}
