// react-bootstrap
import { ListGroup, Dropdown } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';

// -----------------------|| NAV LEFT ||-----------------------//

export default function NavLeft() {
  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <Dropdown as="li" className="pc-h-item">
        <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 active ">
          Welcome to BLG India

        </Dropdown.Toggle>
       
      </Dropdown>
    </ListGroup>
  );
}
