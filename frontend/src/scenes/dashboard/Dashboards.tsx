import React, { useEffect, useState } from 'react'
import { useActions, useValues } from 'kea'
import { dashboardsModel } from '~/models/dashboardsModel'
import { Button, Card, Col, Drawer, Row, Spin } from 'antd'
import { dashboardsLogic } from 'scenes/dashboard/dashboardsLogic'
import { Link } from 'lib/components/Link'
import { PlusOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import { PushpinFilled, PushpinOutlined, DeleteOutlined, AppstoreAddOutlined } from '@ant-design/icons'
import { NewDashboard } from 'scenes/dashboard/NewDashboard'
import { PageHeader } from 'lib/components/PageHeader'
import { createdAtColumn, createdByColumn } from 'lib/components/Table'
import { DashboardType } from '~/types'
import { ObjectTags } from 'lib/components/ObjectTags'
import { userLogic } from 'scenes/userLogic'
import { ColumnType } from 'antd/lib/table'

export function Dashboards(): JSX.Element {
    const { dashboardsLoading } = useValues(dashboardsModel)
    const { deleteDashboard, unpinDashboard, pinDashboard, addDashboard } = useActions(dashboardsModel)
    const { setNewDashboardDrawer } = useActions(dashboardsLogic)
    const { dashboards, newDashboardDrawer, dashboardTags } = useValues(dashboardsLogic)
    const { user } = useValues(userLogic)
    const [displayedColumns, setDisplayedColumns] = useState([] as ColumnType<DashboardType>[])

    const columns: ColumnType<DashboardType>[] = [
        {
            title: '',
            width: 24,
            align: 'center',
            render: function Render({ id, pinned }: DashboardType) {
                return (
                    <span
                        onClick={() =>
                            pinned ? unpinDashboard(id, 'dashboards_list') : pinDashboard(id, 'dashboards_list')
                        }
                        style={{ color: 'rgba(0, 0, 0, 0.85)', cursor: 'pointer' }}
                    >
                        {pinned ? <PushpinFilled /> : <PushpinOutlined />}
                    </span>
                )
            },
        },
        {
            title: 'Dashboard',
            dataIndex: 'name',
            key: 'name',
            render: function Render(name: string, { id }: { id: number }) {
                return (
                    <Link data-attr="dashboard-name" to={`/dashboard/${id}`}>
                        {name || 'Untitled'}
                    </Link>
                )
            },
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: function Render(description: string) {
                return <>{description || <span style={{ color: 'var(--muted)' }}>Dashboard has no description</span>}</>
            },
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: function Render(tags: string[]) {
                return tags.length ? (
                    <ObjectTags tags={tags} staticOnly />
                ) : (
                    <span style={{ color: 'var(--muted)' }}>Dashboard has no tags</span>
                )
            },
            filters: dashboardTags.map((tag) => {
                return { text: tag, value: tag }
            }),
            onFilter: (value, record) => typeof value === 'string' && record.tags.includes(value),
        },
        createdAtColumn() as ColumnType<DashboardType>,
        createdByColumn(dashboards) as ColumnType<DashboardType>,
        {
            title: 'Actions',
            align: 'center',
            width: 120,
            render: function RenderActions({ id }: DashboardType) {
                return (
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => deleteDashboard({ id, redirect: false })}
                        className="text-danger"
                    >
                        <DeleteOutlined />
                    </span>
                )
            },
        },
    ]

    useEffect(() => {
        if (!user?.organization?.available_features.includes('dashboard_collaboration')) {
            setDisplayedColumns(
                columns.filter((col) => !col.dataIndex || !['description', 'tags'].includes(col.dataIndex.toString()))
            )
        } else {
            setDisplayedColumns(columns)
        }
    }, [user?.organization?.available_features, dashboardTags])

    return (
        <div>
            <PageHeader title="Dashboards" />
            <div className="mb text-right">
                <Button
                    data-attr={'new-dashboard'}
                    onClick={() => setNewDashboardDrawer(true)}
                    type="primary"
                    icon={<PlusOutlined />}
                >
                    New Dashboard
                </Button>
            </div>

            <Drawer
                title={'New Dashboard'}
                width={400}
                onClose={() => setNewDashboardDrawer(false)}
                destroyOnClose={true}
                visible={newDashboardDrawer}
            >
                <NewDashboard />
            </Drawer>

            <Card>
                {dashboardsLoading ? (
                    <Spin />
                ) : dashboards.length > 0 ? (
                    <Table
                        dataSource={dashboards}
                        rowKey="id"
                        size="small"
                        pagination={{ pageSize: 100, hideOnSinglePage: true }}
                        columns={displayedColumns}
                    />
                ) : (
                    <div>
                        <p>Create your first dashboard:</p>

                        <Row gutter={24}>
                            <Col xs={24} xl={6}>
                                <Card
                                    title="Empty"
                                    size="small"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        addDashboard({
                                            name: 'New Dashboard',
                                            show: true,
                                            useTemplate: '',
                                        })
                                    }
                                >
                                    <div style={{ textAlign: 'center', fontSize: 40 }}>
                                        <AppstoreAddOutlined />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} xl={6}>
                                <Card
                                    title="App Default"
                                    size="small"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        addDashboard({
                                            name: 'Web App Dashboard',
                                            show: true,
                                            useTemplate: 'DEFAULT_APP',
                                        })
                                    }
                                >
                                    <div style={{ textAlign: 'center', fontSize: 40 }}>
                                        <AppstoreAddOutlined />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>
        </div>
    )
}
