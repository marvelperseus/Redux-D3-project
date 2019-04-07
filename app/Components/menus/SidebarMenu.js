import React from 'react'
import { Link, NavLink, withRouter } from 'react-router-dom'
import { Sidebar, Menu, Image, Icon } from 'semantic-ui-react'

const SidebarMenu = () => (
    <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        borderless
        width="thin"
        className="with-bottom-item"
    >
        <Menu.Item as={Link} className="logo" to="/">
            <Image src='public/img/logo.png' />
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="home" />
            Home <span className="sr-only">(current)</span>
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="map" />
            Map Explorer <span className="sr-only">(current)</span>
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="chart bar" />
            Data Analysis <span className="sr-only">(current)</span>
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="copy" />
            Document Explorer <span className="sr-only">(current)</span>
        </Menu.Item>
        <Menu.Item as={NavLink} to="/graphs">
            <Icon name="object group" />
            Basin Modeling
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="user" />
            Account
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="rss" />
            Channels
        </Menu.Item>
        <Menu.Item as="a">
            <Icon name="setting" />
            Settings
        </Menu.Item>
        <Menu.Item as="a" className="bottom-item">
            <Icon name="log out" />
            Log out
        </Menu.Item>
    </Sidebar>
)
export default withRouter(SidebarMenu)
