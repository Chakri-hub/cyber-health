import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <section className="page_404">
      <div className="container">
        <div className="row"> 
          <div className="col-sm-12">
            <div className="col-sm-10 col-sm-offset-1 text-center">
              <div className="four_zero_four_bg">
                <h1 className="text-center">404</h1>
              </div>
              
              <div className="contant_box_404">
                <h3 className="h2">Looks like you're lost</h3>
                
                <p>The page you are looking for is not available!</p>
                
                <Link to="/" className="link_404">Go to Home</Link>
                <div className="mt-4">
                  <Link to="/contact" className="link_404">Contact Support</Link>
                </div>
                

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFound;