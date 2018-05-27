import React, { Component } from "react";
import "./App.css";
import Map from "./Map.js";
import Navbar from "./Navbar.js";
import Sidebar from "./Sidebar.js";
import { handleLocalStorage, processData } from "./functions.js";

//node modules
import { graphql } from "react-apollo";
import { withRouter } from "react-router-dom";
import { Layout } from "antd";
import { Row, Col } from "antd";
import { seasonQuery } from "./Database.js";
import ReactGA from "react-ga";
const googleAnalyticsId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
const { Footer } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    this.sideBar = React.createRef();
    this.map = React.createRef();
    this.state = {
      selectedSeason: 4,
      seasons: null,
      localStorage: {},
      compWidth: window.innerWidth
    };
    ReactGA.initialize(googleAnalyticsId);
    ReactGA.pageview(window.location.pathname);
  }

  updateSeason = season => {
    this.setState({ localStorage: season });
  };

  updateSelectedSeason = number => {
    this.setState({ selectedSeason: number });
  };

  grabSelectedSeason = number => {
    if (this.state.seasons) {
      return this.state.seasons.find(element => {
        return element.number === number;
      });
    }
  };
  updateWidth = length => {
    this.setState({
      compWidth: window.innerWidth
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.allSeasonQuery &&
      nextProps.allSeasonQuery.allSeasons &&
      !prevState.seasons &&
      prevState.selectedSeason
    ) {
      return {
        seasons: nextProps.allSeasonQuery.allSeasons,
        localStorage: handleLocalStorage(
          nextProps.allSeasonQuery.allSeasons.find(element => {
            return element.number === prevState.selectedSeason;
          })
        )
      };
    } else {
      return {};
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateWidth);
  }

  render() {
    return (
      <div className="App">
        <Row>
          <Col span={24}>
            <Navbar
              updateSelectedSeason={this.updateSelectedSeason}
              data={this.props.allSeasonQuery.allSeasons}
            />
          </Col>
        </Row>
        <Row type="flex">
          <Col xs={{ span: 24, order: 2 }} sm={{ span: 8, order: 1 }}>
            <div ref={this.sideBar}>
              {this.sideBar.current &&
                this.map.current && (
                  <Sidebar
                    sideBarLength={this.sideBar.current.offsetWidth}
                    sideBarHeight={this.map.current.offsetWidth}
                    updateSeason={this.updateSeason}
                    data={this.grabSelectedSeason(this.state.selectedSeason)}
                    localStorage={this.state.localStorage}
                  />
                )}
            </div>
          </Col>
          <Col xs={{ span: 24, order: 1 }} sm={{ span: 16, order: 2 }}>
            <div ref={this.map}>
              {this.state.seasons &&
                this.map.current && (
                  <Map
                    mapLength={this.map.current.offsetWidth}
                    data={processData(
                      this.grabSelectedSeason(this.state.selectedSeason),
                      this.state.localStorage
                    )}
                  />
                )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Footer style={{ textAlign: "center", fontSize: "12px" }}>
              <p>Made with React.js</p>
              <p style={{ fontSize: "8px" }}>
                Portions of the materials used are trademarks and/or copyrighted
                works of Epic Games, Inc. All rights reserved by Epic. This
                material is not official and is not endorsed by Epic.
              </p>
            </Footer>
          </Col>
        </Row>
      </div>
    );
  }
}

const AppWithQuery = graphql(seasonQuery, {
  name: "allSeasonQuery"
})(withRouter(App));

export default AppWithQuery;
