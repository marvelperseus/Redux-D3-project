import React from 'react'
import { Menu, Icon, Input, Dropdown } from 'semantic-ui-react'

const TopMenu = () => (
    <Menu fixed="top" size="massive">
        <Menu.Item className="instant-chat">
            <Icon name="comment outline" flipped="horizontally" />
            <Input placeholder="Talk to Sandy" />
        </Menu.Item>

        <Menu.Item position="right">
            <Icon.Group className="notification">
                <Icon name="bell outline" />
                <Icon
                    corner
                    name="circle"
                    className="upper-corner notification-sign"
                />
            </Icon.Group>
            <div className="header-divider" />
            <Dropdown
                text="John"
                direction="left"
                pointing="top left"
                icon="angle down"
            >
                <Dropdown.Menu>
                    <Dropdown.Item icon="user" text="Account" />
                    <Dropdown.Item icon="log out" text="Log out" />
                </Dropdown.Menu>
            </Dropdown>
            <Icon name="user" className="active-user" />
        </Menu.Item>
    </Menu>
)
export default TopMenu
